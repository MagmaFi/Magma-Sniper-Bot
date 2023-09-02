// textConstants.ts

export const textConstants = {
    textWelcome: "Welcome to Magma Gun Sniper! The best sniper and purchasing bot on ETH. Join the discussion and ask questions in the discussions channel, for announcements  join the announcements channel. If you want to read more about the bot, you can visit our documents.",
    textWelcomeAuthOk: "Welcome to Magma Gun Sniper! Please select a option. You can visit our documents to more info.",
    textAutoSnipe: "Set up how much extra ETH you are willing to pay as a bribe to the builder of the block to get in earlier than the rest of the snipers. This only applies to unlaunched tokens that you are planning to snipe.",
    textManualBuyerGWEI: "Set up how much extra GWEI you are willing to use to get in earlier than the rest of the manual buyers. This only applies to already launched tokens that you are planning to buy. Using more GWEI gets you in earlier positions in the block.",
    textFirstBundleBackupTip: "If the 'First Bundle or Fail' fails, this is where First Bundle Backup gonna kick in.First Bundle Backup is like a snipe with disabled 'First Bundle or Fail' just set up how much extra ETH you are willing to pay as a bribe to the builder of the block to get in earlier than the rest of the snipers",
    textAproveGWEI: "Set up how much extra GWEI you are willing to use to get the token approved following your purchase. Using more GWEI gets you in earlier positions in the block.",
    textSellGWEI: "Set up how much extra GWEI you are willing to use to sell the desired token. Using more GWEI gets you in earlier positions in the block.",
    textSellRugGWEI: "Set up how much extra GWEI you are willing to use to sell the desired token when frontrunning a rug. Using more GWEI gets you in earlier positions in the block.",
    textBuyTax: "Sniper / manual buyer only fires if the buy tax of the selected token is at or lower than this amount. Example: XYZ token launches with 99 buy tax. Magma Bot Gun will not fire, snipe stays in „pending mode”. If the developer lowers the buy tax to 75%, Magma Bot Gun will fire in the same block as the tax change.",
    textMaxSellTax: "Sniper / manual buyer only fires if the selling tax of the selected token is at or lower than this amount. Example: XYZ token launches with 99 sell tax. Magma Bot Gun will not fire, snipe stays in „pending mode”. If the developer lowers the buy tax to 75%, Magma Bot Gun will fire in the same block as the tax change.",
    textMinLiquidValue: "Sniper / manual buyer only fires if the liquidity of the token is at or higher than the amount that the user set up.",
    textMaxLiquidityValue: "Sniper / manual buyer only fires if the liquidity of the token is at or lower than the amount that the user set up.",
    textAntiRug: "If the developer tries to rug the token (any instances that makes the investors unable to sell), Magma Bot will call the Anti-Rug function as long as it is enabled..",
    textTransferOnBlacklist: "If the developer calls a blacklist function in the token contract, Magma Bot will call the Transfer on Blacklist function to send your tokens to the 'transfer wallet' as long as it is enabled. ",
    textFirstBundleFail: "If enabled, Magma Bot will always go for the first buy once the trading starts, it is recommended to have at least 10 participating wallets for this to work well",
    textBundleBackup: "If the First Bundle or Fail doesn't fire because the token has deadblocks (or if it's a MEV launch) and you have First Bundle or Fail Backup enabled, Magma Bot will try and get in after the deadblock (or after the first block in case of MEV launch).",
    textSlippage: 'textSlippage',
  };
  