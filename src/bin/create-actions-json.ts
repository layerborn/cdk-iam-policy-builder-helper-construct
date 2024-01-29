import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
// eslint-disable-next-line import/no-extraneous-dependencies

// Define the output object
let output: { [key: string]: { [key: string]: string } } = {};

// Generate the platform-specific path to your text file
let filePath = path.join('cdk.out/methods_list.txt');

const readInterface = readline.createInterface({
  input: fs.createReadStream(filePath),
  output: process.stdout,
});

readInterface.on('line', (line) => {
  let parts = line.trim().split(':');

  if (parts.length != 2) {
    return; // Invalid format, ignore line
  }

  let namespace = parts[0];
  let method = parts[1];

  if (!(namespace in output)) {
    // Create new namespace object if it doesn't exist
    output[namespace] = {};
  }

  output[namespace][method] = namespace + ':' + method;
});

readInterface.on('close', () => {
  fs.writeFileSync(path.join(__dirname, '..', 'construct', 'Actions.json'), JSON.stringify(output));
});

