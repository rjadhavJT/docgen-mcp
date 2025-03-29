import { Template } from '../templates/manager.js';
import { SourceData } from '../sources/extractor.js';

export async function interpolateTemplate(template: Template, data: SourceData, projectId: string): Promise<string> {
  let content = template.content;
  
  // Replace basic variables
  content = replaceBasicVariables(content, projectId);
  
  // Process each section
  for (const section of template.sections) {
    content = await processSectionContent(content, section, data);
  }
  
  return content;
}

function replaceBasicVariables(content: string, projectId: string): string {
  // Replace basic variables like project ID, date, etc.
  const now = new Date();
  
  content = content.replace(/{{projectId}}/g, projectId);
  content = content.replace(/{{date}}/g, now.toISOString().split('T')[0]);
  content = content.replace(/{{year}}/g, now.getFullYear().toString());
  
  return content;
}

async function processSectionContent(content: string, section: string, data: SourceData): Promise<string> {
  // Find the section marker
  const sectionMarker = `{{section:${section}}}`;
  
  // If section marker doesn't exist, return unchanged
  if (!content.includes(sectionMarker)) {
    return content;
  }
  
  // Generate content for this section
  const sectionContent = await generateSectionContent(section, data);
  
  // Replace section marker with generated content
  return content.replace(sectionMarker, sectionContent);
}

async function generateSectionContent(section: string, data: SourceData): Promise<string> {
  // Different strategies for different sections
  switch (section) {
    case 'objective':
      return generateObjectiveSection(data);
    case 'materials':
      return generateMaterialsSection(data);
    case 'methods':
      return generateMethodsSection(data);
    case 'results':
      return generateResultsSection(data);
    case 'conclusions':
      return generateConclusionsSection(data);
    default:
      return `Content for section ${section} not implemented`;
  }
}

function generateObjectiveSection(data: SourceData): string {
  // Extract objective from presentation or script comments
  // This is a simplified implementation
  
  // Look for presentation source
  const presentationSources = Object.entries(data).filter(([_, info]) => info.type === 'presentation');
  if (presentationSources.length > 0) {
    const presentation = presentationSources[0][1].data;
    if (presentation.extractedInfo && presentation.extractedInfo.objective) {
      return presentation.extractedInfo.objective;
    }
  }
  
  // Look for script sources
  const scriptSources = Object.entries(data).filter(([_, info]) => info.type === 'script' || info.type === 'code');
  if (scriptSources.length > 0) {
    const script = scriptSources[0][1].data;
    if (script.workflow && script.workflow.length > 0) {
      return `Execute the script to ${script.workflow[0].toLowerCase()}`;
    }
  }
  
  return 'Execute analysis on input data';
}

function generateMaterialsSection(data: SourceData): string {
  // Extract materials information
  // This is a simplified implementation
  
  const materials = ['Data was analyzed using custom scripts'];
  
  // Look for script sources to extract tool info
  const scriptSources = Object.entries(data).filter(([_, info]) => info.type === 'script' || info.type === 'code');
  for (const [url, info] of scriptSources) {
    materials.push(`Script: ${url}`);
  }
  
  return materials.join('\n\n');
}

function generateMethodsSection(data: SourceData): string {
  // Extract methods from scripts
  // This is a simplified implementation
  
  const methods = ['The following steps were performed:'];
  
  // Look for script sources
  const scriptSources = Object.entries(data).filter(([_, info]) => info.type === 'script' || info.type === 'code');
  if (scriptSources.length > 0) {
    for (const [_, info] of scriptSources) {
      const script = info.data;
      if (script.workflow && script.workflow.length > 0) {
        methods.push(...script.workflow.map((step: string, index: number) => `${index + 1}. ${step}`));
      }
    }
  }
  
  return methods.join('\n');
}

function generateResultsSection(data: SourceData): string {
  // Extract results from presentation
  // This is a simplified implementation
  
  const results = ['Analysis produced the following results:'];
  
  // Look for presentation source
  const presentationSources = Object.entries(data).filter(([_, info]) => info.type === 'presentation');
  if (presentationSources.length > 0) {
    const presentation = presentationSources[0][1].data;
    if (presentation.extractedInfo && presentation.extractedInfo.key_findings) {
      results.push(...presentation.extractedInfo.key_findings.map((finding: string) => `- ${finding}`));
    }
  }
  
  return results.join('\n');
}

function generateConclusionsSection(data: SourceData): string {
  // Generate conclusions
  // This is a simplified implementation
  
  return 'The analysis was successfully completed. Results are available for further investigation.';
}
