import { Client, GatewayIntentBits, SlashCommandBuilder } from "discord.js";
import fetch from "node-fetch";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once("ready", async () => {
  console.log("QVA Bot Online");

  const commands = [
    new SlashCommandBuilder()
      .setName("approve")
      .setDescription("Approve a pilot")
      .addUserOption(o =>
        o.setName("user").setDescription("User").setRequired(true)
      ),

    new SlashCommandBuilder()
      .setName("deny")
      .setDescription("Deny a pilot")
      .addUserOption(o =>
        o.setName("user").setDescription("User").setRequired(true)
      ),

    new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Bot status"),
  ].map(c => c.toJSON());

  await client.application.commands.set(commands);
});

client.on("interactionCreate", async i => {
  if (!i.isChatInputCommand()) return;

  if (i.commandName === "ping") {
    return i.reply("Pong ✅");
  }

  if (i.commandName === "approve") {
    const member = i.guild.members.cache.get(
      i.options.getUser("user").id
    );
    const role = i.guild.roles.cache.find(r => r.name === "Pilot");
    await member.roles.add(role);

    await fetch(`${process.env.API_URL}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discordId: member.id }),
    });

    i.reply("✅ Pilot approved");
  }

  if (i.commandName === "deny") {
    i.reply("❌ Application denied");
  }
});

client.login(process.env.TOKEN);
