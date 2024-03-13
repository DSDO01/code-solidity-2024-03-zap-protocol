ZAP-PERMISIONLESS-LAUNCHPAD

Install dependencies

npm install

Customize .env file
.env example
privateKey=""

Gas Reporter
Gas reporter can be enabled or disabled by setting gasReporter to true or false in hardhat.config.ts.


Compile
npx hardhat compile

Run tests
npx hardhat test test/USDBtest.js
npx hardhat test test/tokenSale.js
npx hardhat test test/reflectionTest.js
npx hardhat test test/adminTest.js

Run Test Coverage
npx hardhat coverage

Clean artifacts and cache
npx hardhat clean

Deploy script

For local
npx hardhat run --network localhost  scripts/deploy.ts

For others you can refer hardhat docs here


Verify script
Replace the address with your deployed contract,replace constructor arguments with your contract constructor arguments,then in contracts give the path to your main solidity file and then your contract name in verify.ts file.
Note : Make sure to run the verify script after 2min of deployment either you can get an error.



