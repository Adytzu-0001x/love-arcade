import mongoose from "mongoose";
import { env } from "./utils/env";
import MessageTemplate from "./models/MessageTemplate";

// 40 mesaje cu diacritice corecte
const templates: { category: string; text: string; weight?: number }[] = [
  // birthday (15)
  { category: "birthday", text: "La mulți ani, {NAME}! Azi strălucești ca 1000 de licurici ✨" },
  { category: "birthday", text: "Să-ți fie ziua dulce ca un tort cu inimioare, {NAME}! 🎂" },
  { category: "birthday", text: "Încă un an de zâmbete cu tine, {NAME}. Happy birthday! 🥳" },
  { category: "birthday", text: "{NAME}, dorințele tale au VIP la univers azi. La mulți ani! 🌟" },
  { category: "birthday", text: "Îți țin palmele la urechi și suflu toate grijile: la mulți ani! 💨❤️" },
  { category: "birthday", text: "E ziua ta, {NAME}! Dansează, râzi, strălucește 💃" },
  { category: "birthday", text: "La mulți ani cu flori, ciocolată și pupici, {NAME}! 🌸🍫" },
  { category: "birthday", text: "Fiecare lumânare e un nou început. Blow & glow, {NAME}! 🕯️" },
  { category: "birthday", text: "Îți pun coroniță de iubire și bucurie azi, {NAME} 👑" },
  { category: "birthday", text: "La mulți ani! Să-ți fie ziua ușoară ca un nor roz ☁️💕" },
  { category: "birthday", text: "Șampanie, confetti și tine, {NAME}. Perfect mix! 🥂" },
  { category: "birthday", text: "{NAME}, meriți un carusel de îmbrățișări azi! 🎠" },
  { category: "birthday", text: "Primește o super-putere nouă: extra zâmbete. La mulți ani! ⚡" },
  { category: "birthday", text: "Draga mea {NAME}, îți umplu ziua cu inimioare infinite ❤️" },
  { category: "birthday", text: "La mulți ani, {NAME}! Să rămâi mereu lumina mea caldă 🕯️" },
  // compliment (8)
  { category: "compliment", text: "Ochii tăi sunt shortcut-ul meu spre liniște, {NAME}." },
  { category: "compliment", text: "{NAME}, glasul tău sună ca o piesă preferată pe repeat 🎶" },
  { category: "compliment", text: "Îți stă bine cu orice, dar cu zâmbetul cel mai bine 💖" },
  { category: "compliment", text: "{NAME}, ești genul de persoană care face locurile să devină acasă." },
  { category: "compliment", text: "Când spui „hai”, universul parcă zâmbește. 💫" },
  { category: "compliment", text: "Ești curajul și gingășia în același timp, {NAME}." },
  { category: "compliment", text: "Știi să asculți ca nimeni altcineva. Mulțumesc. 🫂" },
  { category: "compliment", text: "{NAME}, strălucești chiar și în hanorac și părul prins în coadă." },
  // encourage (8)
  { category: "encourage", text: "Respiră, {NAME}. Ai mai reușit, vei reuși și azi. 🌱" },
  { category: "encourage", text: "Un pas mic azi, un salt mâine. Continuă! 🚀" },
  { category: "encourage", text: "{NAME}, ai toată puterea de care ai nevoie deja în tine." },
  { category: "encourage", text: "Greul de azi e povestea ta de victorie de mâine. ✨" },
  { category: "encourage", text: "Sunt aici, strâng din pumni pentru tine. 🤞" },
  { category: "encourage", text: "Ai voie să te oprești puțin. Apoi mergem din nou. 💪" },
  { category: "encourage", text: "E ok să fie greu. Ești mai tare decât crezi, {NAME}." },
  { category: "encourage", text: "Când obosești, sprijină-te pe mine. Continuăm împreună. ❤️" },
  // good_morning (5)
  { category: "good_morning", text: "Bună dimineața, {NAME}! Am pregătit o porție de zâmbete ☀️" },
  { category: "good_morning", text: "Cafeaua mea preferată: una cu tine alături. ☕❤️" },
  { category: "good_morning", text: "Trezește-te ușor, azi te așteaptă ceva frumos. 🌸" },
  { category: "good_morning", text: "Dimineața devine mai blândă când îmi scrii „bună”. 😊" },
  { category: "good_morning", text: "Să ai o zi care să-ți semene: caldă și luminoasă." },
  // good_luck (4)
  { category: "good_luck", text: "Baftă, {NAME}! Țin degetele încrucișate pentru tine. 🤞" },
  { category: "good_luck", text: "Ai făcut deja partea grea. Restul e doar confirmare. 🍀" },
  { category: "good_luck", text: "Respiră și amintește-ți: tu poți. Multă baftă! 🌟" },
  { category: "good_luck", text: "{NAME}, lumea e gata să vadă cât ești de grozavă. Succes!" }
];

(async () => {
  await mongoose.connect(env.MONGODB_URI);
  await MessageTemplate.deleteMany({});
  await MessageTemplate.insertMany(templates);
  console.log("Seeded", templates.length, "templates");
  await mongoose.disconnect();
})();
