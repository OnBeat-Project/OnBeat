import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
// import { InteractionHandler, InteractionHandlerTypes, type PieceContext } from '@sapphire/framework';
// import type { AutocompleteInteraction } from 'discord.js';
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
  VoiceConnectionStatus, entersState,
  VoiceConnection,
  AudioResource,
  AudioPlayer,
} from '@discordjs/voice'
import type {
  GuildMember,
  VoiceBasedChannel,
} from 'discord.js'
import sql from '../lib/database/index'
import { VoiceChannels } from '../index'


import { resolveKey } from '@sapphire/plugin-i18next';

@ApplyOptions<Command.Options>({
	description: 'Play your favourite station!'
})
export class PlayCommand extends Command {
  private voiceChannels = VoiceChannels;
  player?: AudioPlayer;
  connection!: VoiceConnection;
  resource?: AudioResource;
  
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
        .addStringOption((option) =>
          option.setName('station').setDescription('Station to play').setAutocomplete(true).setRequired(true)
        )
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		return await this.respondRadios(interaction);
	}
  private async connectToChannel(channel: VoiceBasedChannel) {
	this.connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
	});
	try {
		await entersState(this.connection, VoiceConnectionStatus.Ready, 30_000);
		return this.connection;
	} catch (error) {
		this.connection.destroy();
		throw error;
	}
}
  private async respondRadios(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply({
      ephemeral: true
    })
    const member = interaction.member as GuildMember;
    
    const voice = member.voice.channel;
    const voiceME = interaction.guild?.members.me?.voice.channel;
    const Station = interaction.options.getString('station', true);
    
    const radios = await sql`
      SELECT * FROM radios WHERE id=${Station} AND NOT disabled ORDER BY created_at DESC, verified ASC;
      `
    // console.log(voice)
    if(!voice) return interaction.editReply({
      content: await resolveKey(interaction, "commands/play:errors.noVoice") as string
    });
    if(voiceME && voice?.id !== voiceME?.id) return interaction.editReply({
      content: await resolveKey(interaction, "commands/play:errors.notOnVoice", {VoiceChannel: voiceME?.id}) as string
    }); // lemme test
    if(!radios[0]) return interaction.editReply({
      content: await resolveKey(interaction, "commands/play:errors.findStation") as string
    })

    // working
    this.player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      },
    });
    // const stream = got.stream(radio[0].url, { headers: { 'User-Agent': 'OnBeat/3.0.0' } });
    /*if (!stream) return interaction.editReply({
      content: await resolveKey(interaction, "commands/play:errors.findStation") as string
    });*/
    this.connection = await this.connectToChannel(voice);
    const stream = radios[0].url;
    const resource = createAudioResource(stream, {
      metadata: {
        title: radios[0].id,
      },
      inlineVolume: true
    });
    /*const sub = */ this.connection.subscribe(this.player)
    
    this.connection.setSpeaking(true);
    this.player.play(resource)
    const vc: any = this.voiceChannels.get(voice.id);
    if(!vc || vc.station !== radios[0].id) {
      this.voiceChannels.set(voice.id, {
        startedBy: member.id,
        guild: interaction.guild,
        voiceChannel: voice,
        connection: this.connection,
        resource,
        player: this.player,
        station: radios[0].id
      })
    }
    // 
    
    
    return interaction.editReply({
      content: await resolveKey(interaction, "commands/play:success.playing.title", { station: radios[0].name}) as string
    })
  }
}