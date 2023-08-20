import {DISCORD_ACCESS_TOKEN, DISCORD_ENABLED, TELEGRAM_ENABLED, TWITTER_ENABLED} from './secrets'
//import {DiscordClient} from './clients/discordClient'
import {Client} from 'discord.js'
import RpcClient from './clients/client'
import {TwitterApi} from 'twitter-api-v2'
import { Context, Scenes, session, Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import {Update} from 'telegraf/typings/core/types/typegram'
import {defaultActivity} from './integrations/discord'
//import {TwitterClient} from './clients/twitterClient'
import {TelegramClient} from './clients/telegramClient'
import {GetPrices} from './integrations/coingecko'
import {TrackEvents} from './event/blockEvent'
import {alchemyProvider} from './clients/ethersClient'
import {GetVeloData} from './integrations/velo'
import {GetTokensData} from './constants/tokenIds'
import { Markup } from 'telegraf';
import fs from 'fs'
import { ethers } from 'ethers';

let botIndex = 0;
let startBlockNumber: number | undefined
let registeredUsers: { [userId: number]: string } = {};
let userSettings: { [userId: number]: any } = {};  // Initialize an object to store user settings
let userWallets: { [userId: number]: any } = {};  // Initialize an object to store user settings

export class Bot {
    //discordClient: Client<boolean> = DiscordClient
    //twitterClient: TwitterApi = TwitterClient
    telegramClient: Telegraf<Context<Update>> = TelegramClient
    rpcClient = new RpcClient(alchemyProvider)
    alarm: NodeJS.Timeout | undefined
    isTimerRunning: boolean = false;
    registeredUsers: any = []
    

    textWelcome = "Welcome to Magma Gun Sniper! The best sniper and purchasing bot on ETH. Join the discussion and ask questions in the discussions channel, for announcements  join the announcements channel. If you want to read more about the bot, you can visit our documents."
    textWelcomeAuthOk = "Welcome to Magma Gun Sniper! Please select a option. You can visit our documents to more info."
    textAutoSnipe = "Set up how much extra ETH you are willing to pay as a bribe to the builder of the block to get in earlier than the rest of the snipers. This only applies to unlaunched tokens that you are planning to snipe."
    textManualBuyerGWEI = "Set up how much extra GWEI you are willing to use to get in earlier than the rest of the manual buyers. This only applies to already launched tokens that you are planning to buy. Using more GWEI gets you in earlier positions in the block."
    textFirstBundleBackupTip = "If the 'First Bundle or Fail' fails, this is where First Bundle Backup gonna kick in.First Bundle Backup is like a snipe with disabled 'First Bundle or Fail' just set up how much extra ETH you are willing to pay as a bribe to the builder of the block to get in earlier than the rest of the snipers"
    textAproveGWEI = "Set up how much extra GWEI you are willing to use to get the token approved following your purchase. Using more GWEI gets you in earlier positions in the block."
    textSellGWEI = "Set up how much extra GWEI you are willing to use to sell the desired token. Using more GWEI gets you in earlier positions in the block."
    textSellRugGWEI = "Set up how much extra GWEI you are willing to use to sell the desired token when frontrunning a rug. Using more GWEI gets you in earlier positions in the block."
    textBuyTax = "Sniper / manual buyer only fires if the buy tax of the selected token is at or lower than this amount. Example: XYZ token launches with 99 buy tax. Banana Gun will not fire, snipe stays in „pending mode”. If the developer lowers the buy tax to 75%, Banana Gun will fire in the same block as the tax change."
    textMaxSellTax = "Sniper / manual buyer only fires if the selling tax of the selected token is at or lower than this amount. Example: XYZ token launches with 99 sell tax. Banana Gun will not fire, snipe stays in „pending mode”. If the developer lowers the buy tax to 75%, Banana Gun will fire in the same block as the tax change."
    textMinLiquidValue = "Sniper / manual buyer only fires if the liquidity of the token is at or higher than the amount that the user set up."
    textMaxLiquidityValue = "Sniper / manual buyer only fires if the liquidity of the token is at or lower than the amount that the user set up."
    textSlippage = 'textSlippage'
    stage: any
    


    async init(dev: boolean) {
        startBlockNumber = Number(process.env.LAST_BLOCK)
        botIndex++;
        console.log(`[Info] bot init...`);
        
        //await this.SetUpDiscord();
        //await this.SetUpTwitter();
        //await this.SetUpTelegram();
        this.SetUpTelegramTrader()
    
        global.ENS = {};
        if (!global.TOKEN_PRICES)
            global.TOKEN_PRICES = {};
        global.TOKEN_IMAGES = {};
        global.VELO_DATA = [];
        global.PAIR_ADDRESSES = [];
        global.BRIBE_ADDRESSES = [];
    
        //await this.reload();
        //await startTrackEvents()            
    }
    
    async startTrackEvents(){
        /*if (this.alarm) {
            clearInterval(this.alarm);
            this.alarm = undefined;
        }
    
        // Call TrackEvents once before the interval
        if (!this.isTimerRunning) {
            this.isTimerRunning = true;
    
            try {
                await TrackEvents(
                    botIndex,
                    this.discordClient,
                    this.telegramClient,
                    this.twitterClient,
                    this.rpcClient,
                    
                );
                console.log(`[Info] Finished tracking events.`);
            } catch (error) {
                console.error(`[Info] An error occurred while tracking events: ${error}`);
            } finally {
                this.isTimerRunning = false;
            }
    
            this.alarm = setInterval(async () => {
                if (!this.isTimerRunning) {
                    this.isTimerRunning = true;
                    console.log(`[Info] Updating data...`);
                    this.reload();
    
                    try {
                        await TrackEvents(
                            botIndex,
                            this.discordClient,
                            this.telegramClient,
                            this.twitterClient,
                            this.rpcClient,
                            
                        );
                        console.log(`[Info] Finished tracking events.`);
                    } catch (error) {
                        console.error(`[Info] An error occurred while tracking events: ${error}`);
                    } finally {
                        this.isTimerRunning = false;
                    }
                }
            }, 20 * 60 * 1000);
        } else {
            console.log(`[Info] Timer is already running. Skipping...`);
        }*/
    }

    async reload() {
        console.log(`[Info] Reloading data...`)
        await GetTokensData();
        await GetPrices();
        await GetVeloData();
    }
        
    async SetUpDiscord() {
        /*if (DISCORD_ENABLED) {
            this.discordClient = DiscordClient
            this.discordClient.on('ready', async (client: any) => {
                console.debug(`[Info] Discord ${client.user?.tag}!`)
            })
            await this.discordClient.login(DISCORD_ACCESS_TOKEN)
            await defaultActivity(this.discordClient)
        }*/
    }
    
    async SetUpTwitter() {
        /*if (TWITTER_ENABLED) {
            this.twitterClient = TwitterClient
            this.twitterClient.readWrite
        }*/
    }
    
    async SetUpTelegram() {
        if (TELEGRAM_ENABLED) {
            this.telegramClient = TelegramClient
        }
    }

    async retryAsync(fn: any, maxRetries: any, retryDelay: any) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                console.error('[Error] Attempt ${i + 1} of ${maxRetries}. Retrying in ${retryDelay / 1000} seconds...');
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
        throw new Error('[Error] Failed after ${maxRetries} retries.');
    }


    /** TRADER BOT */

    isUserAuthenticated(userId: any) {
        return registeredUsers[userId] !== undefined;
    }

    loadRegistrationData() {
        try {
            const data = fs.readFileSync('registration_cache.json', 'utf-8');
            registeredUsers = JSON.parse(data);
            console.log('Registration data loaded from cache file.', registeredUsers);
        } catch (error) {
            console.error('Error loading registration data:', error);
            registeredUsers = {};
        }
    }

    /** WALLETS */

    generateNewWallet() {
        const wallet = ethers.Wallet.createRandom();
        const address = wallet.address;
        return address;
    }
    

    async saveUserWalletToFile(userWallet: any): Promise<void> {
        try {
            const userWalletJSON = JSON.stringify(userWallet, null, 2);
            fs.writeFileSync('user_wallets.json', userWalletJSON);
            console.log('User wallet data saved to file.');
        } catch (error) {
            console.error('Error saving user wallet:', error);
            throw error;
        }
    }

    loadUserWallets() {
        try {
            const data = fs.readFileSync('user_wallets.json', 'utf-8');
            userWallets = JSON.parse(data);
            console.log('Wallet data loaded from cache file:', userWallets);
        } catch (error) {
            console.error('Error loading user wallets:', error);
            userWallets = {};
        }
    }

    /** SETTINGS */

    saveUserSettingsToFile(userSettings: any): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const userSettingsJSON = JSON.stringify(userSettings, null, 2);
                fs.writeFileSync('user_settings.json', userSettingsJSON);
                resolve();
            } catch (error) {
                console.error('Error saving user settings:', error);
                reject(error);
            }
        });
    }
    
    
    loadUserSettings() {
        try {
            const data = fs.readFileSync('user_settings.json', 'utf-8');
            userSettings = JSON.parse(data);
            console.log('User settings data loaded from cache file.', userSettings);
        } catch (error) {
            console.error('Error loading registration data:', error);
            registeredUsers = {};
        }
    }

    populateDefaultUserSettings(userId: any) {
        userSettings[userId] = {
            modify_auto_sniper_tip: 0.01,
            modify_first_bundle_backup_tip: 0.005,
            modify_manual_buyer_gwei: 5.0,
            modify_slippage: 0,
            modify_approve_gwei: 2.0,
            modify_sell_gwei: 3.0,
            modify_sell_rug_gwei: 10.0,
            modify_max_buy_tax: 50,
            modify_max_sell_tax: 50,
            modify_min_liquidity_value: 0,
            modify_max_liquidity_value: 0,            
            toggle_anti_rug: 0,
            toggle_transfer_on_blacklist: 0,            
            toggle_first_bundle_or_fail: 0,
            toggle_bundle_backup: 0
        };
    }


    settingsMessage = async (userId: any) => {
        let userSettings = this.getUserSettings(userId);
    
        if (!userSettings) {
            this.populateDefaultUserSettings(userId);
            userSettings = this.getUserSettings(userId); 
        }

        console.log('Loading.. ', userSettings)
    
        const defaultSettings: {
            modify_auto_sniper_tip: number;
            modify_first_bundle_backup_tip: number;
            modify_manual_buyer_gwei: number;
            modify_slippage: number;
            modify_approve_gwei: number;
            modify_sell_gwei: number;
            modify_sell_rug_gwei: number;
            modify_max_buy_tax: number;
            modify_max_sell_tax: number;
            modify_min_liquidity_value: number;
            modify_max_liquidity_value: number;
            toggle_anti_rug: number;
            toggle_transfer_on_blacklist: number;
            default_manual_wallets: number;
            toggle_first_bundle_or_fail: number;
            toggle_bundle_backup: number
        } = {
            modify_auto_sniper_tip: 0.01,
            modify_first_bundle_backup_tip: 0.005,
            modify_manual_buyer_gwei: 5.0,
            modify_slippage: 0,
            modify_approve_gwei: 2.0,
            modify_sell_gwei: 3.0,
            modify_sell_rug_gwei: 10.0,
            modify_max_buy_tax: 50,
            modify_max_sell_tax: 50,
            modify_min_liquidity_value: 0,
            modify_max_liquidity_value: 0,
            toggle_anti_rug: 0,
            toggle_transfer_on_blacklist: 0,
            default_manual_wallets: 0,
            toggle_first_bundle_or_fail: 0,
            toggle_bundle_backup: 0
        };
    
    
        for (const setting in defaultSettings) {
            if (!(setting in userSettings)) {
                const typedSetting = setting as keyof typeof defaultSettings; 
                userSettings[typedSetting] = defaultSettings[typedSetting];
            }
        }

    
        return `
         User Configuration:
    
         Auto Snipe Miner Tip: ${userSettings.modify_auto_sniper_tip} ETH
         First Bundle or Fail Backup Miner Tip: ${userSettings.modify_first_bundle_backup_tip} ETH
         Manual Buyer Extra: ${userSettings.modify_manual_buyer_gwei} GWEI
         Slippage: ${userSettings.modify_slippage}
         Approve Extra: ${userSettings.modify_approve_gwei} GWEI
         Sell Extra: ${userSettings.modify_sell_gwei} GWEI
         Sell Rug Extra: ${userSettings.modify_sell_rug_gwei} GWEI
         Max Allowed Buy Tax: ${userSettings.modify_max_buy_tax}%
         Max Allowed Sell Tax: ${userSettings.modify_max_sell_tax}%
         Min Allowed Liquidity: ${userSettings.modify_min_liquidity_value}
         Max Allowed Liquidity: ${userSettings.modify_max_liquidity_value}
         Wallets Setup: ${userSettings.wallets_setup}
         Default Wallet: ${userSettings.default_wallet}
         Default Auto Wallets: ${userSettings.default_auto_wallets}
         Default Manual Wallets: ${userSettings.default_manual_wallets}
         Default Anti-Rug: ${userSettings.toggle_anti_rug}
         Default Transfer on Blacklist: ${userSettings.defaultTransferOnBlacklist}
         Default First Bundle or Fail: ${userSettings.toggle_first_bundle_or_fail}
         Default First Bundle or Fail Backup (Deadblocks/MEV Launch): ${userSettings.toggle_bundle_backup}
         Select Below To Modify:
         `;
    };
    

    getUserSettings(userId: any) {
        return userSettings[userId];
    }

    /** SETUP */

    async SetUpTelegramTrader() {

        this.loadRegistrationData()
        this.loadUserWallets()
        this.loadUserSettings()

        
        if (TELEGRAM_ENABLED) {
            this.telegramClient = TelegramClient 
            
            this.stage = new Scenes.Stage();
            const settingsScene = new Scenes.BaseScene("settings");
            const walletScene = new Scenes.BaseScene("wallets");

            this.stage.register(settingsScene);
            this.stage.register(walletScene);

            this.telegramClient.use(session());
            this.telegramClient.use(this.stage.middleware());

    
            this.telegramClient.start(async (ctx) => {
                this.startConversation(ctx);
            });
    
            this.telegramClient.action('Registration', async (ctx) => {
                this.registerUser(ctx);
            });
    
            this.telegramClient.action('Close', async (ctx) => {
                await ctx.reply('Goodbye!');
            });

            this.telegramClient.action('Back', async (ctx) => {
                this.mainMenu(ctx)          
            });
    
            this.telegramClient.action(['Auto sniper', 'Manual buyer', 'Cancel all snipe(s)'], async (ctx) => {
                await ctx.reply(`Hello ${ctx.from?.first_name}! We're almost finish this ... Please wait`);
            });
    
            this.telegramClient.action('Settings', async (ctx) => {
                this.settingsMenu(ctx);
            });
    
            const settingsActions = [
                'modify_auto_sniper_tip', 'modify_first_bundle_backup_tip', 'modify_manual_buyer_gwei', 
                'modify_slippage', 'modify_approve_gwei', 'modify_sell_gwei', 'modify_sell_rug_gwei', 
                'modify_max_buy_tax', 'modify_max_sell_tax', 'modify_min_liquidity_value', 
                'modify_max_liquidity_value', 'toggle_anti_rug', 'toggle_transfer_on_blacklist', 'wallets',
                'toggle_first_bundle_or_fail', 'toggle_bundle_backup', 'back'
            ];
    
            for (const action of settingsActions) {
                this.telegramClient.action(action, async (ctx) => {
                    const title = this.getTitleForAction(action);
                    const reply = this.getReplyForAction(action);
                    this.modifySettings(ctx, title, reply, action);
                });
            }

            
            this.telegramClient.action('add_wallet', async (ctx) => {
                this.addWallet(ctx)
            });

            this.telegramClient.action('add_transfer_wallet', async (ctx) => {
                this.addTransferWallet(ctx)
            });

            this.telegramClient.action('delete_wallet', async (ctx) => {
                this.deleteWallet(ctx)
            });

            this.telegramClient.action('default_wallet', async (ctx) => {
                this.defaultWallet(ctx)
            });

            this.telegramClient.action('default_wallet_auto', async (ctx) => {
                this.defaultWalletAuto(ctx)
            });

            this.telegramClient.action('default_wallet_manual', async (ctx) => {
                this.defaultWalletAuto(ctx)
            });
    
            this.telegramClient.launch();
        }
    }
                        
    async startConversation(ctx: any){

        const userId = ctx.from.id;

        if (!this.isUserAuthenticated(userId))
            this.registrationMenu(ctx)
        else
            this.mainMenu(ctx)          
    }

    async mainMenu(ctx: any){

        await ctx.reply(this.textWelcome,
            
            Markup.inlineKeyboard([ 
                [                
                    Markup.button.callback('🎯 Auto sniper', 'Auto sniper'),
                    Markup.button.callback('🛒 Manual buyer', 'Manual buyer')
                ],
                [
                    Markup.button.callback('❌ Cancel all snipe(s)', 'Cancel all snipe(s)'),
                    Markup.button.callback('⚙️ Settings', 'Settings')
                ]                
            ])
        );
    }

    async registrationMenu(ctx: any){

        await ctx.reply(this.textWelcome,
            Markup.inlineKeyboard([
                Markup.button.callback('🔫 Register', 'Registration'),
                Markup.button.callback('❌ Close', 'Close')
            ])
        );
    }
    
    async settingsMenu(ctx: any) {
        const userId = ctx.from.id;

        if (!this.isUserAuthenticated(userId)) {
            await ctx.reply('You are not registered. Please register first.');
            return;
        }

        const message = await this.settingsMessage(userId);
            
        await ctx.reply(message,
            Markup.inlineKeyboard([
                [
                    Markup.button.callback('🔧 Auto Sniper Tip', 'modify_auto_sniper_tip'),
                    Markup.button.callback('🔧 First Bundle Backup Tip', 'modify_first_bundle_backup_tip')
                ],
                [
                    Markup.button.callback('🔧 Manual Buyer Gwei', 'modify_manual_buyer_gwei'),
                    Markup.button.callback('🔧 Slippage', 'modify_slippage')
                ],
                [
                    Markup.button.callback('🔧 Approve Gwei', 'modify_approve_gwei'),
                    Markup.button.callback('🔧 Wallets', 'wallets'),                    
                ],
                [
                    Markup.button.callback('🔧 Sell Gwei', 'modify_sell_gwei'),
                    Markup.button.callback('🔧 Sell Rug Gwei', 'modify_sell_rug_gwei'),                    
                ],
                [
                    Markup.button.callback('🔧 Max Buy Tax', 'modify_max_buy_tax'),
                    Markup.button.callback('🔧 Max Sell Tax', 'modify_max_sell_tax'),                    
                ],
                [
                    Markup.button.callback('🔧 Min Liquidity Value', 'modify_min_liquidity_value'),
                    Markup.button.callback('🔧 Max Liquidity Value', 'modify_max_liquidity_value')
                ],
                [                    
                    Markup.button.callback('🛡️ Toggle Anti Rug', 'toggle_anti_rug'),
                    Markup.button.callback('🛑 Toggle Transfer on Blacklist', 'toggle_transfer_on_blacklist'),                    
                ],
                [
                    Markup.button.callback('🎯 Toggle First Bundle or Fail', 'toggle_first_bundle_or_fail'),
                    Markup.button.callback('🎯 Toggle Bundle Backup', 'toggle_bundle_backup'),                    
                ],
                [
                    Markup.button.callback('⬅️ Back', 'Back'),
                    Markup.button.callback('❌ Close', 'Close'),                    
                ]
            ])
        );
    
    }

    
    getTitleForAction(action: string): string {
        switch (action) {
            case 'modify_auto_sniper_tip':
                return this.textAutoSnipe;
            case 'modify_first_bundle_backup_tip':
                return this.textFirstBundleBackupTip;
            case 'modify_manual_buyer_gwei':
                return this.textManualBuyerGWEI;
            case 'modify_slippage':
                return this.textSlippage;
            case 'modify_approve_gwei':
                return this.textAproveGWEI;
            case 'modify_sell_gwei':
                return this.textSellGWEI;
            case 'modify_sell_rug_gwei':
                return this.textSellRugGWEI;
            case 'modify_max_buy_tax':
                return this.textBuyTax;
            case 'modify_max_sell_tax':
                return this.textMaxSellTax;
            case 'modify_min_liquidity_value':
                return this.textMinLiquidValue;
            case 'modify_max_liquidity_value':
                return this.textMaxLiquidityValue;            
            default:
                return 'Default Title';
        }
    }
    
    getReplyForAction(action: string): string {
        
        switch (action) {
            case 'modify_auto_sniper_tip':
                return 'Auto Snipe Miner Tip';
            case 'modify_first_bundle_backup_tip':
                return 'First Bundle or Fail Backup Miner Tip';
            case 'modify_manual_buyer_gwei':
                return 'Manual Buyer Extra';
            case 'modify_slippage':
                return 'Slippage';
            case 'modify_approve_gwei':
                return 'Approve Extra';
            case 'modify_sell_gwei':
                return 'Sell Extra';
            case 'modify_sell_rug_gwei':
                return 'Sell Rug Extra';
            case 'modify_max_buy_tax':
                return 'Max Allowed Buy Tax';
            case 'modify_max_sell_tax':
                return 'Max Allowed Sell Tax';
            case 'modify_min_liquidity_value':
                return 'Min Allowed Liquidity';
            case 'modify_max_liquidity_value':
                return 'Max Allowed Liquidity';            
            default:
                return action;        
        }
    }

    /** ACTIONS */
    
    async registerUser(ctx: any) {
        const userId = ctx.from.id;
        const token = Math.random().toString(36).substr(2, 10);
        registeredUsers[userId] = token;
    
        try {
            const registrationData = JSON.stringify(registeredUsers);
            this.populateDefaultUserSettings(userId)
            
            fs.writeFileSync('registration_cache.json', registrationData);
            console.log('Registration data saved to cache file.');
        } catch (error) {
            console.error('Error saving registration data:', error);
        }
    
        await ctx.reply(`Registration successful! Your token: ${token}`);
        this.mainMenu(ctx);
    }

   
    async modifySettings(ctx: any, title: any, reply: string, action: any) {
        const userId = ctx.from.id;

        if (!userId || !registeredUsers[userId]) {
            await ctx.reply('You are not registered. Please register first.');
            return;
        }

        if (action === 'wallets') {
            this.walletSettings(ctx)
        }
        else {
            this.changeConfig(ctx, title, reply, action)
        }        
    }

    async changeConfig(ctx: any, title: any, reply: string, action: any){

        await ctx.reply(title);
        await ctx.reply('Please enter the new value:');
        const userId = ctx.from.id;

        const settingsScene = new Scenes.BaseScene("settings");
        
        settingsScene.on("text", async (sceneCtx) => {
            const amount = parseFloat(sceneCtx.message.text);

            if (isNaN(amount)) {
                await sceneCtx.reply('Invalid input. Please enter a valid number.');
                return;
            }

            if (!userSettings[userId]) {
                userSettings[userId] = {};
            }

            userSettings[userId] = {
                ...userSettings[userId],
                [action]: amount,
            };

            await this.saveUserSettingsToFile(userSettings);
            await sceneCtx.reply(`${reply} has been set to ${amount} ETH.`);
            await ctx.scene.leave("settings");

            this.settingsMenu(ctx);
        });

        this.stage.register(settingsScene);

        await ctx.scene.enter("settings");
    }


    async walletSettings(ctx: any) {
        const userId = ctx.from.id;
    
        const existingWallets = userSettings[userId]?.wallets || [];
    
        let walletInfo = `Modify Wallets\n\n` +
            `Default Wallet: ${userSettings[userId]?.defaultWallet || 'Not Set'}\n` +
            `Default Auto Wallets: ${userSettings[userId]?.defaultAutoWallets || 'Not Set'}\n` +
            `Default Manual Wallets: ${userSettings[userId]?.defaultManualWallets || 'Not Set'}\n\n` +
            `Existing Wallet(s):\n`;
    
        existingWallets.forEach((wallet: any, index: number) => {
            walletInfo += `${index + 1} - ${wallet}\n      0 ETH\n`; 
        });
    
        walletInfo += `\nTransfer Wallet(s):\n\n` +
            `You Can Add Up To ${3 - existingWallets.length} More Wallets!\n` + 
            `You Can Add Up To ${5 - existingWallets.length} More Transfer Wallets!\n\n` +
            `Select Option:`;
    
        await ctx.replyWithMarkdown(walletInfo);
    
        await ctx.reply('Select an option:', Markup.inlineKeyboard([
            [
                Markup.button.callback('🔧 Add Wallet', 'add_wallet'),
                Markup.button.callback('🔧 Add Transfer Wallet', 'add_transfer_wallet'),
            ],
            [
                Markup.button.callback('🔧 Delete Wallet', 'delete_wallet'),
                Markup.button.callback('🔧 Default Wallet', 'default_wallet'),
            ],
            [

                Markup.button.callback('🔧 Default Wallet(s) Auto', 'default_wallet_auto'),
                Markup.button.callback('🔧 Default Wallet(s) Manual', 'default_wallet_manual'),],
            [
                Markup.button.callback('⬅️ Back', 'Back'),
                Markup.button.callback('❌ Close', 'Close')
            ]
                                    
        ]));
    }

    async addWallet(ctx: any) {
        const userId = ctx.from.id;

        if (!userWallets[userId]) {
            userWallets[userId] = {}; 
        }
    
        const existingWallets = userWallets[userId]?.wallets || [];
        const transferWallets = userWallets[userId]?.transferWallets || [];
    
        if (existingWallets.length >= 3 || transferWallets.length >= 5) {
            await ctx.reply("You've reached the maximum number of allowed wallets.");
            return;
        }
    
        const newWallet = this.generateNewWallet(); 
    
        existingWallets.push(newWallet);
    
        userWallets[userId].wallets = existingWallets;
    
        await this.saveUserWalletToFile(userWallets); 
    
        await ctx.reply(`New wallet added:\n${newWallet}`);
    
        await this.walletSettings(ctx);
    }
    
    async addTransferWallet(ctx: any) {
        const userId = ctx.from.id;

        
        if (!userWallets[userId]) {
            userWallets[userId] = {}; 
        }
    
        const existingWallets = userWallets[userId]?.wallets || [];
        const transferWallets = userWallets[userId]?.transferWallets || [];
    
        if (transferWallets.length >= 5 || existingWallets.length >= 3) {
            await ctx.reply("You've reached the maximum number of allowed transfer wallets.");
            return;
        }
    
        const newWallet = this.generateNewWallet(); 
    
        transferWallets.push(newWallet);
    
        userWallets[userId].transferWallets = transferWallets;
    
        await this.saveUserWalletToFile(userWallets); 
    
        await ctx.reply(`New transfer wallet added:\n${newWallet}`);
    
        await this.walletSettings(ctx);
    }
    

    async defaultWallet(ctx: any) {
        const userId = ctx.from.id;
    
        
        if (!userWallets[userId]) {
            userWallets[userId] = {}; 
        }

        if (!userWallets[userId]?.wallets || userWallets[userId]?.wallets.length === 0) {
            await ctx.reply("You don't have any wallets to set as default.");
            return;
        }

        const defaultWalletScene = new Scenes.BaseScene("defaultWalletScene");
        
        defaultWalletScene.on("text", async (sceneCtx) => {
            const amount = parseFloat(sceneCtx.message.text);

            if (isNaN(amount)) {
                await sceneCtx.reply('Invalid input. Please enter a valid number.');
                return;
            }

            if (!userWallets[userId]) {
                userWallets[userId] = {};
            }

            userWallets[userId] = {
                ...userWallets[userId],
                ['default_wallet']: amount,
            };

            await this.saveUserWalletToFile(userWallets);
            await sceneCtx.reply(`The default wallet has been set to ${amount}.`);
            await ctx.scene.leave("defaultWalletScene");            
        });

        this.stage.register(defaultWalletScene);

        await ctx.scene.enter("defaultWalletScene");
    
        const walletOptions = userWallets[userId].wallets.map((wallet: any, index: number) => `${index + 1} - ${wallet}`);
        const walletPrompt = `Select the wallet to set as default:\n${walletOptions.join("\n")}`;
    
        await ctx.reply(walletPrompt);
        ctx.session.action = 'set_default_wallet';
        ctx.session.walletType = 'default';
    }
    
    async defaultWalletAuto(ctx: any) {
        const userId = ctx.from.id;

        
        if (!userWallets[userId]) {
            userWallets[userId] = {}; 
        }
    
        if (!userWallets[userId]?.wallets || userWallets[userId]?.wallets.length === 0) {
            await ctx.reply("You don't have any wallets to set as default auto wallet.");
            return;
        }
    
        const walletOptions = userWallets[userId].wallets.map((wallet: any, index: number) => `${index + 1} - ${wallet}`);
        const walletPrompt = `Select the wallet to set as default auto wallet:\n${walletOptions.join("\n")}`;
    
        await ctx.reply(walletPrompt);
        ctx.session.action = 'set_default_auto_wallet';
        ctx.session.walletType = 'defaultAuto';
    }
    
    async deleteWallet(ctx: any) {
        const userId = ctx.from.id;

        
        if (!userWallets[userId]) {
            userWallets[userId] = {}; 
        }
    
        if (!userWallets[userId]?.wallets || userWallets[userId]?.wallets.length === 0) {
            await ctx.reply("You don't have any wallets to delete.");
            return;
        }
    
        const walletOptions = userWallets[userId].wallets.map((wallet: any, index: number) => `${index + 1} - ${wallet}`);
        const walletPrompt = `Select the wallet to delete:\n${walletOptions.join("\n")}`;
    
        await ctx.reply(walletPrompt);
        ctx.session.action = 'delete_wallet';
    }
    
    async deleteWalletManual(ctx: any) {
        const userId = ctx.from.id;

        
        if (!userWallets[userId]) {
            userWallets[userId] = {}; 
        }
    
        if (!userWallets[userId]?.wallets || userWallets[userId]?.wallets.length === 0) {
            await ctx.reply("You don't have any wallets to delete.");
            return;
        }
    
        const walletOptions = userWallets[userId].wallets.map((wallet: any, index: number) => `${index + 1} - ${wallet}`);
        const walletPrompt = `Select the wallet to delete:\n${walletOptions.join("\n")}`;
    
        await ctx.reply(walletPrompt);
        ctx.session.action = 'delete_wallet_manual';
    }
    




    

    


    
    
}


