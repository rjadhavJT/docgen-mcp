#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { extractFromSources } from './sources/extractor.js';
import { generateDocumentation } from './generators/documentation.js';
import { loadTemplate, listTemplates } from './templates/manager.js';
import { documentHistory } from './history/tracker.js';

class DocGenServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'docgen-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    
    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'create_documentation',
          description: 'Create documentation from source files using a template',
          inputSchema: {
            type: 'object',
            properties: {
              template_type: {
                type: 'string',
                description: 'Type of documentation template to use (e.g., "CRISPRseq_Analysis")',
              },
              project_id: {
                type: 'string',
                description: 'Project identifier (e.g., "JUVR058")',
              },
              sources: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    url: {
                      type: 'string',
                      description: 'URL or path to the source file',
                    },
                    type: {
                      type: 'string',
                      enum: ['presentation', 'script', 'code', 'reference'],
                      description: 'Type of source file',
                    },
                    description: {
                      type: 'string',
                      description: 'Brief description of the source',
                    }
                  },
                  required: ['url'],
                }
              },
              output_path: {
                type: 'string',
                description: 'Path where to save the generated documentation',
              }
            },
            required: ['template_type', 'project_id', 'sources'],
          },
        },
        {
          name: 'list_templates',
          description: 'List available documentation templates',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: 'Optional category to filter templates',
              }
            },
          },
        },
        {
          name: 'view_document_history',
          description: 'View history of previously generated documents',
          inputSchema: {
            type: 'object',
            properties: {
              project_id: {
                type: 'string',
                description: 'Filter by project ID',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of history entries to return',
              }
            },
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'create_documentation':
          return await this.handleCreateDocumentation(request.params.arguments);
        case 'list_templates':
          return await this.handleListTemplates(request.params.arguments);
        case 'view_document_history':
          return await this.handleViewHistory(request.params.arguments);
        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
      }
    });
  }

  private async handleCreateDocumentation(args: any) {
    try {
      // Extract data from each source
      const extractedData = await extractFromSources(args.sources);
      
      // Load the appropriate template
      const template = await loadTemplate(args.template_type);
      
      // Generate documentation using the template and extracted data
      const documentation = await generateDocumentation({
        template,
        data: extractedData,
        projectId: args.project_id,
      });
      
      // Save to history
      await documentHistory.saveEntry({
        projectId: args.project_id,
        template: args.template_type,
        sources: args.sources,
        timestamp: new Date().toISOString(),
        outputPath: args.output_path,
      });
      
      // Return the generated documentation
      return {
        content: [
          {
            type: 'text',
            text: documentation,
          },
        ],
      };
    } catch (error) {
      console.error(error);
      return {
        content: [
          {
            type: 'text',
            text: `Error generating documentation: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }

  private async handleListTemplates(args: any) {
    try {
      const templates = await listTemplates(args.category);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(templates, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error listing templates: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }

  private async handleViewHistory(args: any) {
    try {
      const history = await documentHistory.getEntries(args.project_id, args.limit);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(history, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error retrieving history: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }

  public async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('DocGen MCP server running on stdio');
  }
}

const server = new DocGenServer();
server.run().catch(console.error);
