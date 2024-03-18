import { getAuth, getCadence, updateCadence } from "@/utils/forms";
import { SlashCommandBuilder, ChatInputCommandInteraction, Guild } from "discord.js";


const setCadence = {
    data: new SlashCommandBuilder()
      .setName("cadence")
      .setDescription(
        "Set cadence for newsletter"
      ),
  
    async execute(interaction: ChatInputCommandInteraction) {
      await interaction.deferReply();
      const auth = getAuth();

      var currentCadence = '';
      const cadence = await getCadence({auth});
      switch (cadence) {
        case 7:
          currentCadence = 'weekly';
          break;
        case 14:
          currentCadence = 'bi-weekly';
          break;
        case 30:
          currentCadence = 'monthly';
          break;
        default:
          currentCadence = 'none';
      }
      await interaction.followUp(`Current cadence is ${currentCadence}`);
      

      const sentMessage = await interaction.channel?.send('Please pick a cadence (week, bi-weekly, monthly)');
      await sentMessage?.react('7️⃣');
      await sentMessage?.react('🏳️‍🌈');
      await sentMessage?.react('🇲');

      const collectorFilter = (reaction: any, user: any) => {
        return ['7️⃣', '🏳️‍🌈', '🇲'].includes(reaction.emoji.name) && user.id === interaction.user.id;
      };
      // waits 30 sec for user to pick
      const reactions = await sentMessage?.awaitReactions({max: 1, time: 30000, filter: collectorFilter});
      const userReactionName = reactions?.first()?.emoji.name;

      const guildID = sentMessage?.guild?.id ?? '';
      const channelID = sentMessage?.channel.id ?? '';
      switch (userReactionName) {
        case '7️⃣':
          await updateCadence({auth, guildID, channelID, newCadence: 7});
          await interaction.channel?.send("Successfully changed to weekly");
          console.log("user picked weekly");
          break;
        case '🏳️‍🌈':
          await updateCadence({auth, guildID, channelID, newCadence: 14});
          await interaction.channel?.send("Successfully changed to bi-weekly");
          console.log("user picked bi-weekly");
          break;
        case '🇲':
          await updateCadence({auth, guildID, channelID, newCadence: 30});
          await interaction.channel?.send("Successfully changed to monthly");
          console.log("user picked monthly");
          break;
        default:
          await interaction.channel?.send("User didn't pick anything");
      }
    },
  };
  
  export default setCadence;