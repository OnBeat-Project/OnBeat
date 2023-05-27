import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { InteractionHandler, InteractionHandlerTypes, PieceContext } from '@sapphire/framework';
import type { AutocompleteInteraction } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Play your favorite station!'
})
export class PlayCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		return await this.respondRadios(interaction);
	}

  private async respondRadios(interaction: Command.ChatInputCommandInteraction) {
    interaction.reply("Hi")
  }
}

export class AutocompleteHandler extends InteractionHandler {
  public constructor(ctx: PieceContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Autocomplete
    });
  }

  public override async run(interaction: AutocompleteInteraction, result: InteractionHandler.ParseResult<this>) {
    return interaction.respond(result);
  }

  public override async parse(interaction: AutocompleteInteraction) {
    // Only run this interaction for the command with ID '1000802763292020737'
    if (interaction.commandId !== '1000802763292020737') return this.none();

    // Get the focussed (current) option
    const focusedOption = interaction.options.getFocused(true);

    // Ensure that the option name is one that can be autocompleted, or return none if not.
    switch (focusedOption.name) {
      case 'search': {
        // Search your API or similar. This is example code!
        const searchResult = await myApi.searchForSomething(focusedOption.value as string);

        // Map the search results to the structure required for Autocomplete
        return this.some(searchResult.map((match) => ({ name: match.name, value: match.key })));
      }
      default:
        return this.none();
    }
  }
}