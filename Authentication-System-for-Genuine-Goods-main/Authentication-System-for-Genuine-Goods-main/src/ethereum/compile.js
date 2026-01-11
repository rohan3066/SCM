import path from 'path';
import fs from 'fs-extra'
import solc from 'solc';

fs.removeSync('build');
const source = fs.readFileSync('D:\\PBL FINAL\\Fake-Product-Identification\\src\\ethereum\\contracts\\FakeProdIden.sol', 'utf-8');

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