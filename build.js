import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildExtension() {
  const distDir = join(__dirname, 'dist');
  const srcDir = join(__dirname, 'src');
  const rootIconsDir = join(__dirname, 'icons');
  const tempDir = join(__dirname, 'temp_extension');
  
  try {
    // Create a temporary directory for extension files
    await fs.emptyDir(tempDir);
    
    // Copy extension files to temp directory
    await fs.copy(join(srcDir, 'manifest.json'), join(tempDir, 'manifest.json'));
    await fs.copy(join(srcDir, 'popup.html'), join(tempDir, 'popup.html'));
    await fs.copy(join(srcDir, 'popup.js'), join(tempDir, 'popup.js'));
    await fs.copy(join(srcDir, 'content.js'), join(tempDir, 'content.js'));
    
    // Check if styles.css exists in src directory, otherwise use the root one
    if (await fs.pathExists(join(srcDir, 'styles.css'))) {
      await fs.copy(join(srcDir, 'styles.css'), join(tempDir, 'styles.css'));
    } else {
      await fs.copy(join(__dirname, 'styles.css'), join(tempDir, 'styles.css'));
    }
    
    // Use icons from root directory if they exist, otherwise use from src
    if (await fs.pathExists(rootIconsDir)) {
      await fs.copy(rootIconsDir, join(tempDir, 'icons'));
    } else if (await fs.pathExists(join(srcDir, 'icons'))) {
      await fs.copy(join(srcDir, 'icons'), join(tempDir, 'icons'));
    }
    
    // Now build the React app (this will clean and populate the dist directory)
    console.log('Building React app...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Copy extension files from temp directory to dist
    console.log('Copying extension files to dist...');
    await fs.copy(tempDir, distDir, { overwrite: true });
    
    // Clean up temp directory
    await fs.remove(tempDir);
    
    console.log('Extension built successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    // Clean up temp directory in case of error
    if (await fs.pathExists(tempDir)) {
      await fs.remove(tempDir);
    }
    throw error;
  }
}

buildExtension().catch(console.error);