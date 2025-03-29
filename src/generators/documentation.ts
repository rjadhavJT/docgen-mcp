import { interpolateTemplate } from './interpolation.js';
import { enhanceWithPerplexity } from '../enhancers/perplexity.js';
import { Source, SourceData } from '../sources/extractor.js';
import { Template } from '../templates/manager.js';

export interface DocumentationOptions {
  template: Template;
  data: SourceData;
  projectId: string;
}

export async function generateDocumentation(options: DocumentationOptions): Promise<string> {
  try {
    // First pass: basic interpolation of template with data
    let document = await interpolateTemplate(options.template, options.data, options.projectId);
    
    // Second pass: enhance content with Perplexity
    document = await enhanceWithPerplexity(document, options.data);
    
    // Format and clean the document
    document = formatDocument(document);
    
    return document;
  } catch (error) {
    console.error('Error generating documentation:', error);
    throw error;
  }
}

function formatDocument(document: string): string {
  // Clean up any remaining template markers
  document = document.replace(/{{[^}]+}}/g, '');
  
  // Fix double spaces
  document = document.replace(/\s{2,}/g, ' ');
  
  // Fix empty lines
  document = document.replace(/\n{3,}/g, '\n\n');
  
  return document;
}
