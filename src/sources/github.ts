import axios from 'axios';

export interface GitHubContent {
  content: string;
  type: string;
  name?: string;
}

export interface GitHubRepo {
  owner: string;
  repo: string;
  path: string;
}

export async function fetchFromGitHub(url: string): Promise<GitHubContent> {
  try {
    // Parse GitHub URL to extract owner, repo, path
    const { owner, repo, path } = parseGitHubUrl(url);
    
    // Use GitHub MCP server or GitHub API
    const content = await getGitHubContent(owner, repo, path);
    
    return content;
  } catch (error) {
    console.error('Error fetching from GitHub:', error);
    throw error;
  }
}

function parseGitHubUrl(url: string): GitHubRepo {
  // Extract owner, repo, path from GitHub URL
  // Example: https://github.com/owner/repo/blob/branch/path/to/file
  const regex = /github\.com\/([^\/]+)\/([^\/]+)(?:\/blob\/[^\/]+)?(?:\/(.+))?/;
  const match = url.match(regex);
  
  if (!match) {
    throw new Error('Invalid GitHub URL');
  }
  
  return {
    owner: match[1],
    repo: match[2],
    path: match[3] || '',
  };
}

async function getGitHubContent(owner: string, repo: string, path: string): Promise<GitHubContent> {
  // In a real implementation, this would call the GitHub MCP server
  // This is a placeholder implementation
  console.log(`Accessing GitHub content: ${owner}/${repo}/${path}`);
  
  // Mock response
  return {
    content: 'Mocked GitHub content',
    type: detectFileType(path),
    name: path.split('/').pop() || 'unknown',
  };
}

function detectFileType(path: string): string {
  if (path.endsWith('.sh') || path.endsWith('.bash')) {
    return 'shell';
  } else if (path.endsWith('.py')) {
    return 'python';
  } else if (path.endsWith('.R') || path.endsWith('.r')) {
    return 'r';
  } else if (path.endsWith('.js') || path.endsWith('.ts')) {
    return 'javascript';
  } else {
    return 'unknown';
  }
}
