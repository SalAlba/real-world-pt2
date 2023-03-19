import { createApp } from "./app";
import { config } from "./config";

const port = config.PORT;
const app = createApp(config);
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
