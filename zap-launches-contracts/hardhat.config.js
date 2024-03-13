///// verify  /////
/////////////////////////////
require('dotenv').config();
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy-ethers")
require('hardhat-abi-exporter');
// require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-web3");
require("solidity-coverage");
require('hardhat-spdx-license-identifier');
require('hardhat-contract-sizer');
require('hardhat-deploy');
const privateKey = process.env.PRIVATE_KEY;
module.exports = {
  solidity: "0.8.19",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
    contractSizer: {
          alphaSort: true,
          disambiguatePaths: false,
          runOnCompile: true,
          strict: true,
          only: ["Admin", "TokenSale"],
        },
  },
  etherscan: {
    apiKey: {
      blast_sepolia: "blast_sepolia", // apiKey is not required, just set a placeholder
    },
    customChains: [
      {
        network: "blast_sepolia",
        chainId: 168587773,
        urls: {
          apiURL: "https://api.routescan.io/v2/network/testnet/evm/168587773/etherscan",
          browserURL: "https://testnet.blastscan.io"
        }
      }
    ]
  },
  networks: {
    blast_sepolia: {
      url: 'https://sepolia.blast.io',
      accounts: [`0x${privateKey}`]
    },
  },
};

/////////////////////////
        //  deploy  //
///////////////////////////////////////////
// require('dotenv').config();
// require("@nomiclabs/hardhat-etherscan");
// require("@nomiclabs/hardhat-waffle");
// require("@nomiclabs/hardhat-ethers");
// require("hardhat-deploy-ethers")
// require('hardhat-abi-exporter');
// // require("hardhat-gas-reporter");
// require("@nomiclabs/hardhat-web3");
// require("solidity-coverage");
// require('hardhat-spdx-license-identifier');
// require('hardhat-contract-sizer');
// require('hardhat-deploy');


// const privateKey = process.env.PRIVATE_KEY;
// // const alchemyApi = process.env.ALCHEMY_API;
// // This is a sample Hardhat task. To learn how to create your own go to
// // https://hardhat.org/guides/create-task.html
// task("accounts", "Prints the list of accounts", async () => {
//   const accounts = await ethers.getSigners();

//   for (const account of accounts) {
//     console.log(account.address);
//   }
// });

// // You need to export an object to set up your config
// // Go to https://hardhat.org/config/ to learn more

// /**
//  * @type import('hardhat/config').HardhatUserConfig
//  */
// module.exports = {
//   gasReporter: {
//     currency: 'CHF',
//     gasPrice: 21
//   },
//   contractSizer: {
//     alphaSort: true,
//     disambiguatePaths: false,
//     runOnCompile: true,
//     strict: true,
//     only: ["Admin", "TokenSale"],
//   },
//   solidity: "0.8.19",
//   settings: {
//     optimizer: {
//       enabled: true,
//       runs: 200,
//     }
//   },
//   namedAccounts: {
//     deployer: {
//       default: 0,
//     },
//     staker: {
//       default: 1,
//     },
//     alice: {
//       default: 2,
//     }
//   },
//   networks: {
//     blast_sepolia: {
//       url: 'https://sepolia.blast.io',
//       accounts: [`0x${privateKey}`]
//     },
//     local: {
//       url: 'http://127.0.0.1:8545/',
//       allowUnlimitedContractSize: true,
//       accounts: ['0xc13dc6ee0769c578ebdecff5b09cb1481b955d31bd41dbfa7c151026a0abf224'],
//       blockGasLimit: 1200000000,
//     },
//   },

//   spdxLicenseIdentifier: {
//     overwrite: true,
//     runOnCompile: true,
//   },
//   paths: {
//     deploy: 'deploy',
//     deployments: 'deployments',
//     imports: 'imports'
//   },
//   etherscan: {
//     apiKey: {
//       blast_sepolia: "blast_sepolia", // apiKey is not required, just set a placeholder
//     }
//   },
//     // etherscan: {
//     //   apiKey: "ETG1DI3IVA14X293WQ3R2PT5C1IIJ58FJ5"
//     // },
//     mocha: {
//       timeout: 100000
//     }
// }

