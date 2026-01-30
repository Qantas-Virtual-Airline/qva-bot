import { Client, GatewayIntentBits, SlashCommandBuilder } from "discord.js";
import fetch from "node-fetch";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const API_URL = process.env.API_URL;
const TOKEN = process.env.TOKEN;

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const approveCmd = new SlashCommandBuilder()
    .setName("approve")
    .setDescription("Approve a pilot application")
    .addUserOption(option =>
      option.setName("user").setDescription("User to approve").setRequired(true)
    );

  await client.application.commands.set([approveCmd]);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "approve") {
    const user = interaction.options.getUser("user");

    // Give Pilot role
    const role = interaction.guild.roles.cache.find(r => r.name === "Pilot");
    if (role) {
      const member = await interaction.guild.members.fetch(user.id);
      await member.roles.add(role);
    }

    // Notify backend (optional logging)
    await fetch(`${API_URL}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discord_id: user.id })
    }).catch(() => {});

    await interaction.reply(`✅ Approved ${user.username}`);
  }
});

client.login(TOKEN);
