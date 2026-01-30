import {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  PermissionFlagsBits,
} from "discord.js";
import fetch from "node-fetch";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once("ready", async () => {
  console.log("QVA Bot Online");

  const commands = [
    new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Check bot status"),

    new SlashCommandBuilder()
      .setName("approve")
      .setDescription("Approve a pilot")
      .addUserOption(o =>
        o.setName("user").setDescription("Pilot").setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    new SlashCommandBuilder()
      .setName("deny")
      .setDescription("Deny a pilot")
      .addUserOption(o =>
        o.setName("user").setDescription("Pilot").setRequired(true)
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    new SlashCommandBuilder()
      .setName("profile")
      .setDescription("View your pilot profile"),

    new SlashCommandBuilder()
      .setName("help")
      .setDescription("List all commands"),

    new SlashCommandBuilder()
      .setName("vatsim")
      .setDescription("Show live Qantas VA flights"),

    new SlashCommandBuilder()
      .setName("simbrief")
      .setDescription("Link your SimBrief username")
      .addStringOption(o =>
        o.setName("username").setDescription("SimBrief username").setRequired(true)
      ),

    new SlashCommandBuilder()
      .setName("bookflight")
      .setDescription("Book a VA flight")
      .addStringOption(o =>
        o.setName("flight").setDescription("Flight number").setRequired(true)
      )
      .addStringOption(o =>
        o.setName("from").setDescription("Departure ICAO").setRequired(true)
      )
      .addStringOption(o =>
        o.setName("to").setDescription("Arrival ICAO").setRequired(true)
      ),
  ].map(c => c.toJSON());

  await client.application.commands.set(commands);
  console.log("Commands registered");
});

client.on("interactionCreate", async i => {
  if (!i.isChatInputCommand()) return;

  const name = i.commandName;

  if (name === "ping") {
    return i.reply("Pong 🟢");
  }

  if (name === "help") {
    return i.reply(
      "**QVA Commands**\n" +
      "/ping\n" +
      "/approve\n" +
      "/deny\n" +
      "/profile\n" +
      "/bookflight\n" +
      "/simbrief\n" +
      "/vatsim"
    );
  }

  if (name === "approve") {
    const member = await i.guild.members.fetch(
      i.options.getUser("user").id
    );
    const role = i.guild.roles.cache.find(r => r.name === "Pilot");
    await member.roles.add(role);

    await fetch(`${process.env.API_URL}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discordId: member.id }),
    });

    return i.reply("✅ Pilot approved");
  }

  if (name === "deny") {
    return i.reply("❌ Application denied");
  }

  if (name === "profile") {
    return i.reply("🧑‍✈️ Pilot profile coming soon");
  }

  if (name === "bookflight") {
    const flight = i.options.getString("flight");
    const from = i.options.getString("from");
    const to = i.options.getString("to");

    return i.reply(
      `✈️ Flight booked\n**${flight}** ${from} → ${to}`
    );
  }

  if (name === "simbrief") {
    const user = i.options.getString("username");
    return i.reply(`🔗 SimBrief linked: **${user}**`);
  }

  if (name === "vatsim") {
    return i.reply("🌍 Live Qantas VA flights coming soon");
  }
});

client.login(process.env.TOKEN);

