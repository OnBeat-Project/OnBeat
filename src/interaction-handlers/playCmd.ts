import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { AutocompleteInteraction, type ApplicationCommandOptionChoiceData } from 'discord.js';
import sql from '../lib/database/index'
// import moment from 'moment'

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Autocomplete
})
export class AutocompleteHandler extends InteractionHandler {
	public override async run(interaction: AutocompleteInteraction, result: ApplicationCommandOptionChoiceData[]) {
		return interaction.respond(result);
	}

	public override async parse(interaction: AutocompleteInteraction) {
		if (interaction.commandId !== '1104899204960235692') return this.none();
		const focusedValue = interaction.options.getFocused(true);
		switch (focusedValue.name) {
      case "station": {
        const radios = await sql`
      SELECT * FROM radios WHERE NOT disabled ORDER BY created_at DESC, verified ASC;
      `
        
        return this.some(radios.filter(r =>  r?.name.toLowerCase().includes(focusedValue.value.toLowerCase()) || r?.id.toLowerCase().includes(focusedValue.value.toLowerCase())).map(r => ({ name: r.name, value: r.id })))
      }
      default:
       return this.none();
    }
	}
}
