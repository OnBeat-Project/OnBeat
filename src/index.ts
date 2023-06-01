import './lib/setup';
import '@sapphire/plugin-i18next/register';
import '@sapphire/plugin-api/register';
import { LogLevel, SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits } from 'discord.js';
import { Collection } from '@discordjs/collection'

const client = new SapphireClient({
	caseInsensitiveCommands: true,
	logger: {
		level: LogLevel.Debug
	},
	intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ],
	loadMessageCommandListeners: true
});

export const VoiceChannels = new Collection();

const main = async () => {
	try {
		client.logger.info('Logging in');
		await client.login();
		client.logger.info('Logged in');
    for (let i = 0; i < 50; i++) {
      client.logger.error('Igor is stinky')
    }
	} catch (error) {
		client.logger.fatal(error);
		client.destroy();
		process.exit(1);
	}
};

main();