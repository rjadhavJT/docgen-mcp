import { fetchFromGDrive } from './gdrive.js';
import { fetchFromGitHub } from './github.js';

export interface Source {
  url: string;
  type?: string;
  description?: string;
}

export interface SourceData {
  [url: string]: {
    type: string;
    data: any;
    description: string;
  };
}

export async function extractFromSources(sources: Source[]): Promise<SourceData> {
  const extractedData: SourceData = {};
  
  for (const source of sources) {
    try {
      let sourceData: any;
      
      // Determine source type if not specified
      const sourceType = source.type || determineSourceType(source.url);
      
      // Get source content based on URL type
      let sourceContent: any;
      if (source.url.includes('drive.google.com')) {
        sourceContent = await fetchFromGDrive(source.url);
      } else if (source.url.includes('github.com')) {
        sourceContent = await fetchFromGitHub(source.url);
      } else {
        // Handle local files or other URLs
        throw new Error(`Unsupported source URL: ${source.url}`);
      }
      
      // Process content based on source type
      switch (sourceType) {
        case 'presentation':
          sourceData = await processPresentation(sourceContent);
          break;
        case 'script':
          sourceData = await processScript(sourceContent);
          break;
        case 'code':
          sourceData = await processScript(sourceContent); // Similar processing
          break;
        case 'reference':
          sourceData = await processDocument(sourceContent);
          break;
        default:
          throw new Error(`Unknown source type: ${sourceType}`);
      }
      
      // Add to extracted data
      extractedData[source.url] = {
        type: sourceType,
        data: sourceData,
        description: source.description || '',
      };
    } catch (error) {
      console.error(`Error processing source ${source.url}:`, error);
      // Continue with other sources
    }
  }
  
  return extractedData;
}

function determineSourceType(url: string): string {
  // Determine source type based on URL or file extension
  if (url.endsWith('.pptx') || url.endsWith('.ppt')) {
    return 'presentation';
  } else if (url.endsWith('.sh') || url.endsWith('.R') || url.endsWith('.py')) {
    return 'script';
  } else if (url.endsWith('.js') || url.endsWith('.ts') || url.endsWith('.java') || 
             url.endsWith('.cpp') || url.endsWith('.c')) {
    return 'code';
  } else if (url.endsWith('.docx') || url.endsWith('.pdf') || url.endsWith('.txt')) {
    return 'reference';
  } else {
    // Default to reference type
    return 'reference';
  }
}

// These functions would be defined in separate modules, but for simplicity we'll declare them here
async function processPresentation(content: any): Promise<any> {
  // This would use an integration with markdownify-mcp or similar
  return {
    slides: [],
    title: 'Mocked Presentation Title',
    extractedInfo: {
      key_findings: [],
      metrics: {}
    }
  };
}

async function processScript(content: any): Promise<any> {
  // This would parse script content
  return {
    commands: [],
    workflow: [],
    parameters: {}
  };
}

async function processDocument(content: any): Promise<any> {
  // This would process document content
  return {
    text: '',
    sections: [],
    metadata: {}
  };
}
