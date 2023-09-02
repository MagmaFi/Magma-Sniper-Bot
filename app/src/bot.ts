import {DISCORD_ACCESS_TOKEN, DISCORD_ENABLED, TELEGRAM_ENABLED, TWITTER_ENABLED} from './secrets'
import {DiscordClient} from './clients/discordClient'
import {Client} from 'discord.js'
import RpcClient from './clients/client'
import {TwitterApi} from 'twitter-api-v2'
import { Context, Scenes, session, Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import {InlineKeyboardButton, Update} from 'telegraf/typings/core/types/typegram'
import {defaultActivity} from './integrations/discord'
import {TwitterClient} from './clients/twitterClient'
import {TelegramClient} from './clients/telegramClient'
import {GetPrices} from './integrations/coingecko'
import {TrackEvents} from './event/blockEvent'
import {alchemyProvider} from './clients/ethersClient'
import {GetVeloData} from './integrations/velo'
import {GetTokensData} from './constants/tokenIds'
import { Markup } from 'telegraf';
import fs from 'fs'
import { ethers } from 'ethers';
import { Triggers } from 'telegraf/typings/composer';
import { textConstants } from './datatext';

let botIndex = 0;
let startBlockNumber: number | undefined
let registeredUsers: { [userId: number]: string } = {};
let userSettings: { [userId: number]: any } = {};  
let userWallets: { [userId: number]: any } = {};  


export class Bot {
    discordClient: Client<boolean> = DiscordClient
    twitterClient: TwitterApi = TwitterClient
    telegramClient: Telegraf<Context<Update>> = TelegramClient
    rpcClient = new RpcClient(alchemyProvider)
    alarm: NodeJS.Timeout | undefined
    isTimerRunning: boolean = false;
    registeredUsers: any = []        
    stage: any
    botMode: number = 0


    async initializeBot(dev: boolean) {
        try {
            this.botMode = Number(process.env.BOT_OPERATION);

            console.log(`[Info] Initializing bot...`);                
            console.log(`[Info] Operation type: `, this.botMode);
    
            if (this.botMode === 1) {
                await this.prepareTrackEvents();
            } else {
                await this.SetUpTelegramTrader();
            }
        } catch (error) {
            console.error(`[Error] An error occurred during bot initialization: ${error}`);
        }
    }
    
    async prepareTrackEvents() {
        try {
            startBlockNumber = Number(process.env.LAST_BLOCK);
            botIndex++;
    
            global.ENS = {};
            if (!global.TOKEN_PRICES) {
                global.TOKEN_PRICES = {};
            }
            global.TOKEN_IMAGES = {};
            global.VELO_DATA = [];
            global.PAIR_ADDRESSES = [];
            global.BRIBE_ADDRESSES = [];
    
            await this.SetUpDiscord();
            await this.SetUpTwitter();
            await this.SetUpTelegram();
            await this.reload();
    
            this.startTrackEvents();
        } catch (error) {
            console.error(`[Error] An error occurred during event tracking preparation: ${error}`);
        }
    }
        
    async startTrackEvents() {
        try {
            if (this.alarm) {
                clearInterval(this.alarm);
                this.alarm = undefined;
            }
    
            if (!this.isTimerRunning) {
                this.isTimerRunning = true;
                await this.trackAndReloadData();
    
                this.alarm = setInterval(async () => {
                    if (!this.isTimerRunning) {
                        this.isTimerRunning = true;
                        console.log(`[Info] Updating data...`);
                        await this.trackAndReloadData();
                    }
                }, 20 * 60 * 1000);
            } else {
                console.log(`[Info] Timer is already running. Skipping...`);
            }
        } catch (error) {
            console.error(`[Error] An error occurred while tracking events: ${error}`);
        }
    }
    
    async trackAndReloadData() {
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
            console.error(`[Error] An error occurred while tracking events: ${error}`);
        } finally {
            this.isTimerRunning = false;
        }
    }

    async reload() {
        try {            
            console.log(`[Info] Reloading data...`)
            await GetTokensData();
            await GetPrices();
            await GetVeloData();
        } catch (error) {
            console.error(`[Error] An error occurred during data reloading: ${error}`);
        }        
    }
        
    async SetUpDiscord() {
        if (DISCORD_ENABLED) {
            this.discordClient = DiscordClient
            this.discordClient.on('ready', async (client: any) => {
                console.debug(`[Info] Discord ${client.user?.tag}!`)
            })
            await this.discordClient.login(DISCORD_ACCESS_TOKEN)
            await defaultActivity(this.discordClient)
        }
    }
    
    async SetUpTwitter() {
        if (TWITTER_ENABLED) {
            this.twitterClient = TwitterClient
            this.twitterClient.readWrite
        }
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



    /****************
     *  TRADER BOT  *
     ***************/

    isUserAuthenticated(userId: any) {
        return registeredUsers[userId] !== undefined;
    }

    loadRegistrationData() {
        try {
            const data = fs.readFileSync('registration_cache.json', 'utf-8');
            registeredUsers = JSON.parse(data);
            console.log('[Info] - Registration data loaded from cache file.', registeredUsers);
        } catch (error) {
            console.error('[Error] - Error loading registration data:', error);
            registeredUsers = {};
        }
    }    

    generateNewWallet() {
        const wallet = ethers.Wallet.createRandom();
        const address = wallet.address;
        return address;
    }
    
    async saveUserWalletToFile(userWallet: any): Promise<void> {
        try {
            const userWalletJSON = JSON.stringify(userWallet, null, 2);
            fs.writeFileSync('user_wallets.json', userWalletJSON);
            console.log('[Info] - User wallet data saved to file.', userWallet);
        } catch (error) {
            console.error('Error saving user wallet:', error);
            throw error;
        }
    }

    loadUserWallets() {
        try {
            const data = fs.readFileSync('user_wallets.json', 'utf-8');
            userWallets = JSON.parse(data);
            console.log('[Info] - Wallet data loaded from cache file:', userWallets);
        } catch (error) {
            console.log('[Error] - loading user wallets:', error);
            userWallets = {};
        }
    }    

    saveUserSettingsToFile(userSettings: any): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const userSettingsJSON = JSON.stringify(userSettings, null, 2);
                fs.writeFileSync('user_settings.json', userSettingsJSON);
                console.log('[Info] - Wallet data saved in cache file:', userWallets);
                resolve();
            } catch (error) {
                console.log('[Error] - Error saving user settings:', error);
                reject(error);
            }
        });
    }
    
    
    loadUserSettings() {
        try {
            const data = fs.readFileSync('user_settings.json', 'utf-8');
            userSettings = JSON.parse(data);
            console.log('[Info] - User settings data loaded from cache file.', userSettings);
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
         Wallets Setup: ${userWallets[userId]?.defaultWallet}
         Default Wallet: ${userWallets[userId]?.defaultWallet}
         Default Auto Wallets: ${userWallets[userId]?.default_auto_wallets}
         Default Manual Wallets: ${userWallets[userId]?.default_manual_wallets}
         Default Anti-Rug: ${userSettings.toggle_anti_rug}
         Default Transfer on Blacklist: ${userSettings.toggle_transfer_on_blacklist}
         Default First Bundle or Fail: ${userSettings.toggle_first_bundle_or_fail}
         Default First Bundle or Fail Backup (Deadblocks/MEV Launch): ${userSettings.toggle_bundle_backup}
         Select Below To Modify:
         `;
    };
    
    getUserSettings(userId: any) {
        return userSettings[userId];
    }
    
    async SetUpTelegramTrader() {

        this.loadRegistrationData()
        this.loadUserWallets()
        this.loadUserSettings()

        
        if (TELEGRAM_ENABLED) {
            this.telegramClient = TelegramClient 
            
            this.stage = new Scenes.Stage();
            const settingsScene = new Scenes.BaseScene("settings");
            const walletScene = new Scenes.BaseScene("wallets");            
            const defaultWalletScene = new Scenes.BaseScene("defaultWalletScene");
            
            this.registerScenes(settingsScene, walletScene, defaultWalletScene);

            this.telegramClient.use(session());
            this.telegramClient.use(this.stage.middleware());

            this.registerActions();
    
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
                    this.modifySettings(ctx, action);
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

            this.telegramClient.action(/delete_wallet_continue:(.+)/, (ctx: any) => {
                this.deleteWalletContinue(ctx)
            });              

            this.telegramClient.action(/delete_wallet_transfer_continue:(.+)/, (ctx: any) => {
                this.deleteWalletTransferContinue(ctx)
            });              

            this.telegramClient.action(/default_wallet_continue:(.+)/, (ctx: any) => {
                this.defaultWalletTransferContinue(ctx)
            });            

            this.telegramClient.action('default_wallet', async (ctx) => {
                this.defaultWallet(ctx)
            });

            this.telegramClient.action('disable_default_wallets', async (ctx) => {
                this.defaultUseTotalWallets(ctx)
            });

            this.telegramClient.action('use_one_wallet', async (ctx) => {
                this.defaultUseTotalWallets(ctx, 1)
            });

            this.telegramClient.action('use_two_wallets', async (ctx) => {
                this.defaultUseTotalWallets(ctx, 2)
            });                                                     

            this.telegramClient.action('disable_manual_wallets', async (ctx) => {
                this.defaultManualTotalWallets(ctx)
            });

            this.telegramClient.action('use_one_wallet_manual', async (ctx) => {
                this.defaultManualTotalWallets(ctx, 1)
            });

            this.telegramClient.action('use_two_wallets_manual', async (ctx) => {
                this.defaultManualTotalWallets(ctx, 2)
            });
    
            this.telegramClient.launch();
        }
    }

    registerScenes(...scenes: Scenes.BaseScene<Context<Update>>[]) {
        scenes.forEach(scene => this.stage.register(scene));
    }

    registerActions() {
        this.registerAction("add_wallet", this.addWallet);
        this.registerAction("add_transfer_wallet", this.addTransferWallet);
        this.registerAction("delete_wallet", this.deleteWallet);
        this.registerAction("default_wallet", this.defaultWallet);
        this.registerAction("default_wallet_auto", this.defaultWalletAuto);
        this.registerAction("default_wallet_manual", this.defaultWalletManual);
    }


    registerAction(actionName: Triggers<Context<Update>>, actionFunction: { (ctx: any): Promise<void>; (ctx: any): Promise<void>; (ctx: any): Promise<void>; (ctx: any): Promise<void>; (ctx: any): Promise<void>; call?: any; }) {
        this.telegramClient.action(actionName, async ctx => {
            await actionFunction.call(this, ctx);
        });
    }

                        
    async startConversation(ctx: any){

        const userId = ctx.from.id;

        if (!this.isUserAuthenticated(userId))
            this.registrationMenu(ctx)
        else
            this.mainMenu(ctx)          
    }

    async mainMenu(ctx: any){

        await ctx.reply(textConstants.textWelcome,
            
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

        await ctx.reply(textConstants.textWelcome,
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
                return textConstants.textAutoSnipe;
            case 'modify_first_bundle_backup_tip':
                return textConstants.textFirstBundleBackupTip;
            case 'modify_manual_buyer_gwei':
                return textConstants.textManualBuyerGWEI;
            case 'modify_slippage':
                return textConstants.textSlippage;
            case 'modify_approve_gwei':
                return textConstants.textAproveGWEI;
            case 'modify_sell_gwei':
                return textConstants.textSellGWEI;
            case 'modify_sell_rug_gwei':
                return textConstants.textSellRugGWEI;
            case 'modify_max_buy_tax':
                return textConstants.textBuyTax;
            case 'modify_max_sell_tax':
                return textConstants.textMaxSellTax;
            case 'modify_min_liquidity_value':
                return textConstants.textMinLiquidValue;
            case 'modify_max_liquidity_value':
                return textConstants.textMaxLiquidityValue;            
            case 'toggle_anti_rug':
                return textConstants.textAntiRug;            
            case 'toggle_transfer_on_blacklist':
                return textConstants.textTransferOnBlacklist;            
            case 'toggle_first_bundle_or_fail':
                return textConstants.textFirstBundleFail;            
            case 'toggle_bundle_backup':
                return textConstants.textBundleBackup;            
            default:
                return 'Default Title';
        }
    }
    
    getReplyForAction(action: string, amount: number = 0): string {        
        
        switch (action) {
            case 'modify_auto_sniper_tip':
                return `Auto Snipe Miner Tip has been set to ${amount} ETH.`;
            case 'modify_first_bundle_backup_tip':
                return `First Bundle or Fail Backup Miner Tip  has been set to ${amount} ETH.`;
            case 'modify_manual_buyer_gwei':
                return `Manual Buyer Extra has been set to ${amount} ETH.`
            case 'modify_slippage':
                return `Slippage has been set to ${amount}%.`
            case 'modify_approve_gwei':
                return `Approve Extra has been set to ${amount} ETH.`;
            case 'modify_sell_gwei':
                return 'Sell Extra has been set to ${amount} ETH.`';
            case 'modify_sell_rug_gwei':
                return `Sell Rug Extra has been set to ${amount}%.`;
            case 'modify_max_buy_tax':
                return `Max Allowed Buy Tax  has been set to ${amount}%.`;
            case 'modify_max_sell_tax':
                return `Max Allowed Sell Tax has been set to ${amount}%.`;
            case 'modify_min_liquidity_value':
                return `Min Allowed Liquidity has been set to ${amount} ETH.`;
            case 'modify_max_liquidity_value':
                return `Max Allowed Liquidity has been set to ${amount} ETH.`;                
            case 'toggle_anti_rug':
                return `Anti Rug has been set to ${amount}.`;
            case 'toggle_transfer_on_blacklist':
                return `Transfer on blacklist has been set to ${amount}.`;
            case 'toggle_first_bundle_or_fail':
                return `First bundle or fail has been set to ${amount}.`;
            case 'toggle_bundle_backup':
                return `First bundle or fail has been set to ${amount}.`;
            default:
                return action;        
        }
    }
    

     /****************
     **  ACTIONS ******
     ***************/
    
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

   
    async modifySettings(ctx: any, action: any) {
        const userId = ctx.from.id;

        if (!userId || !registeredUsers[userId]) {
            await ctx.reply('You are not registered. Please register first.');
            return;
        }

        if (action === 'wallets')
            this.walletSettings(ctx)        
        else 
            this.changeConfig(ctx, action)            
    }

    async changeConfig(ctx: any, action: any){

        const title = this.getTitleForAction(action);
        
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

            const reply = this.getReplyForAction(action, amount);

            await sceneCtx.reply(`${reply}`);
            await ctx.scene.leave("settings");

            this.settingsMenu(ctx);
        });

        this.stage.register(settingsScene);

        await ctx.scene.enter("settings");
    }


    async walletSettings(ctx: any) {
        const userId = ctx.from.id;
    
        const existingWallets = userWallets[userId]?.wallets || [];
        const transferWallets = userWallets[userId]?.transferWallets || [];
    
        let walletInfo = `Wallets Settings\n\n` +
            `Default Wallet: ${userWallets[userId]?.defaultWallet || 'Not Set'}\n` +
            `Default Auto Wallets: ${userWallets[userId]?.default_auto_wallets || 'Not Set'}\n` +
            `Default Manual Wallets: ${userWallets[userId]?.default_manual_wallets || 'Not Set'}\n\n` +
            `Existing Wallet(s):\n`;
    
        existingWallets.forEach((wallet: any, index: number) => {
            walletInfo += `${index + 1} - ${wallet}\n      0 ETH\n`; 
        });
    
        walletInfo += `\nTransfer Wallet(s) (${transferWallets.length} / 5):\n\n`
        
        transferWallets.forEach((wallet: any, index: number) => {
            walletInfo += `${index + 1} - ${wallet}\n      0 ETH\n`; 
        });
        
        walletInfo +=`You Can Add Up To ${3 - existingWallets.length} More Wallets!\n` + 
            `You Can Add Up To ${5 - transferWallets.length} More Transfer Wallets!\n\n`            
    
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
                Markup.button.callback('🔧 Default Wallet(s) Manual', 'default_wallet_manual'),
            ],
            [
                Markup.button.callback('⬅️ Back', 'Back'),
                Markup.button.callback('❌ Close', 'Close')
            ]                                
        ]));
    }
    
    
    initUserWallets(userId: number) {
        if (!userWallets[userId]) {
            userWallets[userId] = {
                wallets: [],
                transferWallets: []
            };
        }
    }

    async addWallet(ctx: any) {
        const userId = ctx.from.id;
        this.initUserWallets(userId);

        const existingWallets = userWallets[userId].wallets || [];
        const transferWallets = userWallets[userId].transferWallets || [];

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
        this.initUserWallets(userId);

        const existingWallets = userWallets[userId].wallets || [];
        const transferWallets = userWallets[userId].transferWallets || [];

        if (transferWallets.length >= 5 || existingWallets.length >= 3) {
            await ctx.reply("You've reached the maximum number of allowed transfer wallets.\n\n");
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
        try {
            const userId = ctx.from.id;
    
            if (!userWallets[userId]) {
                userWallets[userId] = {};
            }

            const walletOptions = [];
            const walletOptionsButtons: (InlineKeyboardButton & { hide?: boolean | undefined; })[][] = [];
    
            if (userWallets[userId]?.wallets && userWallets[userId]?.wallets.length > 0) {
                userWallets[userId].wallets.forEach((wallet: any, index: number) => {
                    const walletText = `${index + 1} - ${wallet}`;
                    walletOptions.push(walletText);
    
                    const callback = `default_wallet_continue:${index}`;
                    walletOptionsButtons.push([
                        Markup.button.callback(`${walletText}`, callback)
                    ]);
                });
            }
                 
            if (walletOptions.length === 0) {
                await ctx.reply("You don't have any wallets to set as default.");
                return;
            }
    
            const walletPrompt = `Select the wallet to set as default:\n`;
            await ctx.reply(walletPrompt, Markup.inlineKeyboard(walletOptionsButtons));
        } catch (error) {
            console.error('Error in defaultWallet:', error);
            await ctx.reply('An error occurred while processing your request. Please try again later.');
        }
    }
    
    
    async defaultWalletAuto(ctx: any) {
        try {
    
            await ctx.reply('Select an option:', Markup.inlineKeyboard([
                [
                    Markup.button.callback('🔧 Disable Default Wallets', 'disable_default_wallets'),                    
                ],                
                [                    
                    Markup.button.callback('🔧 Use 1 Wallet', 'use_one_wallet'),                    
                ],                
                [                    
                    Markup.button.callback('🔧 Use 2 Wallets', 'use_two_wallets'),
                ],                
                [
                    Markup.button.callback('⬅️ Back', 'Back'),
                    Markup.button.callback('❌ Close', 'Close')
                ]                                
            ]));

        } catch (error) {
            console.error('Error in defaultWalletAuto:', error);
            await ctx.reply('An error occurred while processing your request. Please try again later.');
        }
    }


    
    async defaultUseTotalWallets(ctx: any, total: number = 0){
        const userId = ctx.from.id;

        userWallets[userId].default_auto_wallets = total
            
        const msg = `Default Auto Wallet ${userWallets[userId].default_auto_wallets} has been set to ${total}`
        console.log(`[Info] Default Wallet ${userWallets[userId].default_auto_wallets} has been set to ${total}.`)

        await this.saveUserWalletToFile(userWallets);
        
        await ctx.reply(msg);
        this.walletSettings(ctx)
    }

    async defaultManualTotalWallets(ctx: any, total: number = 0){
        const userId = ctx.from.id;

        userWallets[userId].default_manual_wallets = total
            
        const msg = `Default Manual Wallet ${userWallets[userId].default_manual_wallets} has been set to ${total}`
        console.log(`[Info] Default Manual Wallet ${userWallets[userId].default_manual_wallets} has been set to ${total}.`)

        await this.saveUserWalletToFile(userWallets);
        
        await ctx.reply(msg);
        this.walletSettings(ctx)
    }

    
    async deleteWallet(ctx: any) {
        try {
            const userId = ctx.from.id;
    
            if (!userWallets[userId]) {
                userWallets[userId] = {};
            }

            const walletOptions = [];
            const walletOptionsButtons: (InlineKeyboardButton & { hide?: boolean | undefined; })[][] = [];
    
            if (userWallets[userId]?.wallets && userWallets[userId]?.wallets.length > 0) {
                userWallets[userId].wallets.forEach((wallet: any, index: number) => {
                    const walletText = `${index + 1} - ${wallet}`;
                    walletOptions.push(walletText);
    
                    const callback = `delete_wallet_continue:${index}`;
                    walletOptionsButtons.push([
                        Markup.button.callback(`Existing Wallet(s): ${walletText}`, callback)
                    ]);
                });
            }
    
            if (Array.isArray(userWallets[userId]?.transferWallets) && userWallets[userId]?.transferWallets.length > 0) {
                userWallets[userId].transferWallets.forEach((wallet: any, index: number) => {
                    const walletText = `${index + 1} - ${wallet}`;
                    walletOptions.push(walletText);
    
                    const callback = `delete_wallet_transfer_continue:${index}`;
                    walletOptionsButtons.push([
                        Markup.button.callback(`Transfer Wallet(s): ${walletText}`, callback)
                    ]);
                });
            }
    
            if (walletOptions.length === 0) {
                await ctx.reply("You don't have any wallets to delete.");
                return;
            }
    
            const walletPrompt = `Select the wallet to delete:\n`;
            await ctx.reply(walletPrompt, Markup.inlineKeyboard(walletOptionsButtons));
        } catch (error) {
            console.error('Error in deleteWallet:', error);
            await ctx.reply('An error occurred while processing your request. Please try again later.');
        }
    }
    
        
    async deleteWalletContinue(ctx: any){

        const userId = ctx.from.id;
        const index = parseInt(ctx.match[1]); 

        if (userWallets[userId]?.wallets && userWallets[userId].wallets[index]) {
            
            const wallet = userWallets[userId].wallets[index]
            userWallets[userId].wallets.splice(index, 1);
            
            const msg = `Wallet ${wallet} has been deleted.`
            console.log(`[Info] Wallet ${wallet} has been deleted`)
            
            await ctx.reply(msg);
            this.walletSettings(ctx)
        }
    }

    async deleteWalletTransferContinue(ctx: any){

        const userId = ctx.from.id;
        const index = parseInt(ctx.match[1]); 

        if (userWallets[userId]?.transferWallets && userWallets[userId].transferWallets[index]) {
            
            const wallet = userWallets[userId].transferWallets[index]
            userWallets[userId].transferWallets.splice(index, 1);
            
            const msg = `Transfer Wallet ${wallet} has been deleted.`
            console.log(`[Info] Transfer Wallet ${wallet} has been deleted`)

            await this.saveUserWalletToFile(userWallets);
            
            await ctx.reply(msg);
            this.walletSettings(ctx)
        }
    }
    

    async defaultWalletTransferContinue(ctx: any){
        const userId = ctx.from.id;
        const index = parseInt(ctx.match[1]); 

        if (userWallets[userId]?.wallets && userWallets[userId].wallets[index]) {
        
            userWallets[userId].defaultWallet = userWallets[userId].wallets[index]
            
            const msg = `Default Wallet ${userWallets[userId].defaultWallet} has been set`
            console.log(`[Info] Default Wallet ${userWallets[userId].defaultWallet} has been set.`)

            await this.saveUserWalletToFile(userWallets);
            
            await ctx.reply(msg);
            this.walletSettings(ctx)
        }
    }
   
    
    
    async defaultWalletManual(ctx: any) {
        try {
    
            await ctx.reply('Select an option:', Markup.inlineKeyboard([
                [
                    Markup.button.callback('🔧 Disable Manual Wallets', 'disable_manual_wallets'),                    
                ],                
                [                    
                    Markup.button.callback('🔧 Use 1 Wallet', 'use_one_wallet_manual'),                    
                ],                
                [                    
                    Markup.button.callback('🔧 Use 2 Wallets', 'use_two_wallets_manual'),
                ],                
                [
                    Markup.button.callback('⬅️ Back', 'Back'),
                    Markup.button.callback('❌ Close', 'Close')
                ]                                
            ]));

        } catch (error) {
            console.error('Error in defaultWalletAuto:', error);
            await ctx.reply('An error occurred while processing your request. Please try again later.');
        }
    }
                    
}


