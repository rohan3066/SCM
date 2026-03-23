import path from 'path';
import fs from 'fs-extra';
import solc from 'solc';

fs.removeSync('build');
const __dirname = path.resolve(); // Resolving root of the src folder essentially from execution context
const contractPath = path.resolve('contracts', 'FakeProdIden.sol');
const source = fs.readFileSync(contractPath, 'utf-8');

const input = {
    language: 'Solidity',
    sources: {
        'FakeProdIden.sol': {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*']
            },
        },
    },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

fs.ensureDirSync('build');
for(let contract in output.contracts['FakeProdIden.sol'])
{
    fs.outputJSONSync(
        path.resolve('build', contract.replace(':', '') + '.json'),
        output.contracts['FakeProdIden.sol'][contract]
    );
}