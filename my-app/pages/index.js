import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { ethers, providers } from "ethers";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  // walletConnected keep track of whether the user' wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // create a reference to the web3Modal which persists as long as the page is open
  const web3ModalRef = useRef();
  // ENS
  const [ens, setENS] = useState("");
  // save the address of the currently connected account
  const [address, setAddress] = useState("");

  /**
   * Sets the ENS, if the current address has an associated ENS or else it sets the address
   * of the connected account
   */
  const setENSOrAddress = async (address, web3Provider) => {
    // Lookup the ENS related to the given address
    var _ens = await web3Provider.lookupAddress(address);
    // If the address has an ENS or else just set the address
    if (_ens) {
      setENS(_ens);
    } else {
      setAddress(address);
    }
  };

  /**
   * A 'Provider' is needed to interact with the blockchain - reading transactionsm reading balances, reading state etc
   * 
   * A 'signer' is a special type of provider used in case a 'write' transaction needs to be made to the blockchain which involves the connected account 
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to request signatures from the user using Signer functions   * 
   */
  const getProviderOrSigner = async () => {
    // connect to metamask
    // since we store web3Modal as a reference, we need to access the 'current' value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Goerli network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId != 5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change network to Goerli")
    }
    const signer = web3Provider.getSigner();
    // Get the address associated to the signer which is connected to Metamask
    const address = await signer.getAddress();
    // calls the function to set the ENS or Address
    await setENSOrAddress(address, provider);
    return signer;
  };

  /**
   * connectWallet: Connects the network to metamask
   */
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is Metamask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner(true);
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * renderButton: Returns a button based on the state of the dapp
   */
  const renderButton = () => {
    if (walletConnected) {
      <div>Wallet connected</div>;
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }
  };

  /**
   * useEffects are used to react to changes in the state of the website
   * The array at the end of function call represents what state changes will trigger this effect
   * In this case, whenever the value of 'walletConnected' changes - this effect will be called
   */
  useEffect(() => {
    // If wallet is not connected, create a new instance of web3Modal and connect to Metamask
    if (!walletConnected) {
      // Assign the web3Modal class to the reference object by setting it's 'current' value
      // The 'current' value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>ENS Dapp</title>
        <meta name="description" content="ENS-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>
            Welcome to Aden Punks {ens ? ens : address}!
          </h1>
          <div className={styles.description}>
            {/** Using HTML entities for the apostrophe */}
            It&#39;s an NFT collection for Aden Punks.
          </div>
          {renderButton}
        </div>
        <div>
          <img className={styles.image} src="./learnweb3punks.png" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with&#10084; by Ebbie Aden
      </footer>
    </div>
  );
}