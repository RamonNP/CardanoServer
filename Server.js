const express = require("express");
const app = express();
app.get("/", (request,response) => {
  response.send("<span>Hello Word</span>");
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => { 
   console.log(PORT);
}

)