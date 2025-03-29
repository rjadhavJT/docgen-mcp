# DocGen MCP Server

Documentation Generator MCP Server for automated documentation creation from source files.

## Overview

The DocGen MCP server automates the creation of standardized documentation by extracting information from source files and applying templates. It seamlessly integrates with other MCP servers (Google Drive, GitHub, Perplexity) to provide a comprehensive solution.

## Features

- Extract information from GitHub repositories and Google Drive files
- Process multiple source types (scripts, presentations, code, reference documents)
- Template-based document generation
- Document history tracking
- AI-enhanced content generation through Perplexity integration

## Installation

### Prerequisites

- Node.js 16+
- npm or yarn
- Access to Google Drive API (for Google Drive source extraction)
- Access to GitHub API (for GitHub source extraction)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/rjadhav/docgen-mcp.git
   cd docgen-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Add to your MCP settings file:

   ### For Claude Desktop
   Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

   ```json
   {
     "mcpServers": {
       "docgen-mcp": {
         "command": "node",
         "args": ["/path/to/docgen-mcp/build/index.js"],
         "env": {},
         "disabled": false,
         "autoApprove": []
       }
     }
   }
   ```

   ### For VSCode Cline
   Edit the VSCode Claude Dev extension's MCP settings file:
   
   ```json
   {
     "mcpServers": {
       "docgen-mcp": {
         "command": "node",
         "args": ["/path/to/docgen-mcp/build/index.js"],
         "env": {},
         "disabled": false,
         "autoApprove": []
       }
     }
   }
   ```

## Usage

The DocGen MCP server exposes the following tools:

### create_documentation

Generate documentation from source files using a template.

### list_templates

List available documentation templates.

### view_document_history

View history of previously generated documents.

## Templates

Templates are stored in the `templates` directory and use a simple marker system for content generation:

- `{{projectId}}` - Replaced with the project identifier
- `{{date}}` - Current date
- `{{section:NAME}}` - Replaced with generated content for the named section

Custom templates can be added by creating new `.template` files in the templates directory.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
