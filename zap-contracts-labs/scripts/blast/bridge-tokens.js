const { ethers, JsonRpcProvider, parseEther, formatEther } = require("ethers");

const dotenv = require("dotenv");

dotenv.config();

const main = async () => {
  const INFURA_KEY = process.env.INFURA_API_KEY;
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const ETH_AMOUNT_TO_SEND = "0.8";

  const BlastBridgeAddress = "0xc644cc19d2A9388b71dd1dEde07cFFC73237Dca8";

  // Providers for Sepolia and Blast networks
  const sepoliaProvider = new JsonRpcProvider(
    `https://sepolia.infura.io/v3/${INFURA_KEY}`
  );

  const blastProvider = new JsonRpcProvider("https://sepolia.blast.io");

  // Wallet setup
  const wallet = new ethers.Wallet(PRIVATE_KEY);
  const sepoliaWallet = wallet.connect(sepoliaProvider);
  const blastWallet = wallet.connect(blastProvider);

  // Transaction to send ${ETH_AMOUNT_TO_SEND} Sepolia ETH
  const tx = {
    to: BlastBridgeAddress,
    value: parseEther(ETH_AMOUNT_TO_SEND),
  };

  const transaction = await sepoliaWallet.sendTransaction(tx);
  await transaction.wait();

  // Confirm the bridged balance on Blast
  const balance = await blastProvider.getBalance(wallet.address);
  console.log(`Balance on Blast: ${formatEther(balance)} ETH`);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
