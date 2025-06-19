const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const searchRoutes = require("./routes/searchRoutes");
const channelsRoutes = require("./routes/channelsRoutes");
const friendsRoutes = require("./routes/friendsRoutes");
const profileRoutes = require("./routes/profileRoutes");
const publisherRoutes = require("./routes/publisherRoutes");
const editorRoutes = require("./routes/editorRoutes");
const readRoutes = require("./routes/readRoutes");

const { getDrafts, pushDraftsinfo } = require("./db");

const app = express();

//Start Kluster AI

// kluster ai api key
const apiKey = "306f81b0-6ade-40cd-90be-ed5b1d8de539";

async function fetch_kly1(idarticle, paragraph_art, modelname) {
  let returned_result = "";
  const response = await fetch("https://api.kluster.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelname,
      messages: [
        {
          role: "system",
          content:
            "Play a role of a machine-like system giving exact answers and not being conversational. Do not try to answer like Explainable AIs. You are given a paragraph and you must take 4 citations (sentences) and minimum of 2 citation sentences which you know can't be a misinformation based on context of the paragraph. You must also support this sentence from your own knowledge (Max 2 sentences). You are like a web misinformation machine you don't have to explain your logic. Output with this format: first you must number the sentence cited from the paragraph, then add supporting info under the numbering of the cite; add delimiter 5 asterisks after supporting info , dont add asterisk on your chosen citation to make it bold. This is the format: \n1. Cited: [Cited Sentence] \n Supporting Info : [ Your training data, definition etc ] \n2. Cited: [Cited Sentence] \n Supporting Info :   ..etc.",
        },
        { role: "user", content: paragraph_art },
      ],
    }),
  })
    .then(async (fetch_value) => {
      if (!fetch_value.ok) {
        const error = await fetch_value.text();
        throw new Error(`API error: ${error}`);
      } else {
        let res = await fetch_value.body;

        const reader = fetch_value.body.getReader();
        const decoder = new TextDecoder();
        let result = "";
        let done_ = false;
        async function read() {
          return reader.read().then(async ({ done, value }) => {
            if (done) {
              console.log("result is here - add to db here");
              console.log(typeof result);

              returned_result = result;

              console.log("result");

              console.log(JSON.parse(result).choices[0].message.content);
              const data = {
                plid: idarticle,
                model: modelname,
                content: JSON.parse(result).choices[0].message.content,
              };
              // console.log(data);
              const posting = await pushDraftsinfo(data).then(async (vl) => {
                console.log("pushDraftsinfo vl");
                console.log(vl);
              });
              return result; // full response text
            }

            result += decoder.decode(value, { stream: true });
            // Optionally, process partial data here
            read();
          });
        }

        let r = await read().then((response) => {
          console.log("response await reader");
          console.log(response);
          return true;
        });
      }
    })
    .then((v) => {
      console.log("delayed value ");
      console.log(v);
    });
}

async function fetch_kly2(paragraph_art) {
  let returned_result = "";
  const response = await fetch("https://api.kluster.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistralai/Mistral-Small-24B-Instruct-2501",
      messages: [
        {
          role: "system",
          content:
            "Play a role of a machine-like system giving exact answers and not being conversational. Do not try to answer like Explainable AIs. You are given a paragraph (with Cited & Supporting Info) and you must verify the truthfulness of the cited and its supporting info using your own knowledge. If you agree that the cited info (labeled as Cited) is true and the supporting info (labeled as Supporting Info) is also true and really relates to the Cited statement and support it put Yes to Verifier field, if not put No. Then on the Supporting Info add your own knowledge that must also give evidence to the Cited but must be similar in meaning with that supporting info (from the input). Limit your answers to 1-2 sentences. Move to next number in the input and do the same. Instruction for output. First put number then add the label Cited which will have the cited statement from input then under the same number item add the label Verifier this value is Yes or No. Then add Supporting Info label and add your own knowledge. If you answered No to Verifier, then put None on the Supporting Info. Your answer must be 1-2 sentences only, in giving supporting info or definition (for terms). If you see a term on Cited field then just deifine it on the Supporting Info but the definition must be in agreement with the support info from input. If you see a term and the Supporting info does not define the Cited term input, add No to Verifier. Output format: 1. Cited: [ Just copy the the same value from input ] \n Verifier: [Yes/No] \n Supporting Info : [ Your training data, your definition etc ] \n 2. Cited: [ Just copy the the same value from input ] \n Verifier: [Yes/No] \n Supporting Info : [ Your training data, definition etc ] . You are a web misinformation machine you don't have to explain your logic. Don't answer in verbose.",
        },
        { role: "user", content: paragraph_art },
      ],
    }),
  })
    .then(async (fetch_value) => {
      if (!fetch_value.ok) {
        const error = await fetch_value.text();
        throw new Error(`API error: ${error}`);
      } else {
        let res = await fetch_value.body;

        const reader = fetch_value.body.getReader();
        const decoder = new TextDecoder();
        let result = "";
        let done_ = false;
        async function read() {
          return reader.read().then(({ done, value }) => {
            if (done) {
              console.log("result is here - add to db here");
              // console.log(result);
              console.log(JSON.parse(result).choices[0].message.content);
              returned_result = result;

              //TODO : Add to db here

              return result; // full response text
            }

            result += decoder.decode(value, { stream: true });
            // Optionally, process partial data here
            read();
          });
        }

        let r = await read().then((response) => {
          console.log("response await reader");
          console.log(response);
          return response;
        });
      }
    })
    .then((v) => {
      console.log("delayed value ");
      console.log(v);
    });
}

async function fetch_kly3(paragraph_art) {
  let returned_result = "";
  const response = await fetch("https://api.kluster.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-ai/DeepSeek-V3-0324",
      messages: [
        {
          role: "system",
          content:
            "Play a role of a machine-like system giving exact answers and not being conversational. Do not try to answer like Explainable AIs. You are given a paragraph (with Cited & Supporting Info) and you must verify the truthfulness of the cited and its supporting info using your own knowledge. If you agree that the cited info (labeled as Cited) is true and the supporting info (labeled as Supporting Info) is also true and really relates to the Cited statement and support it put Yes to Verifier field, if not put No. Then on the Supporting Info add your own knowledge that must also give evidence to the Cited but must be similar in meaning with that supporting info (from the input). Limit your answers to 1-2 sentences. Move to next number in the input and do the same. Instruction for output. First put number then add the label Cited which will have the cited statement from input then under the same number item add the label Verifier this value is Yes or No. Then add Supporting Info label and add your own knowledge. If you answered No to Verifier, then put None on the Supporting Info. Your answer must be 1-2 sentences only, in giving supporting info or definition (for terms). If you see a term on Cited field then just deifine it on the Supporting Info but the definition must be in agreement with the support info from input. If you see a term and the Supporting info does not define the Cited term input, add No to Verifier. Output format: 1. Cited: [ Just copy the the same value from input ] \n Verifier: [Yes/No] \n Supporting Info : [ Your training data, your definition etc ] \n 2. Cited: [ Just copy the the same value from input ] \n Verifier: [Yes/No] \n Supporting Info : [ Your training data, definition etc ] . You are a web misinformation machine you don't have to explain your logic. Don't answer in verbose.",
        },
        { role: "user", content: paragraph_art },
      ],
    }),
  })
    .then(async (fetch_value) => {
      if (!fetch_value.ok) {
        const error = await fetch_value.text();
        throw new Error(`API error: ${error}`);
      } else {
        let res = await fetch_value.body;

        const reader = fetch_value.body.getReader();
        const decoder = new TextDecoder();
        let result = "";
        let done_ = false;
        async function read() {
          return reader.read().then(({ done, value }) => {
            if (done) {
              console.log("result is here - add to db here");
              console.log(JSON.parse(result).choices[0].message.content);

              returned_result = result;

              //TODO : Add to db here

              return result; // full response text
            }

            result += decoder.decode(value, { stream: true });
            // Optionally, process partial data here
            read();
          });
        }

        let r = await read().then((response) => {
          console.log("response await reader");
          console.log(response);
          return response;
        });
      }
    })
    .then((v) => {
      console.log("delayed value ");
      console.log(v);
    });
}

//Kluster AI

// View engine setup

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", authRoutes);
app.use("/app", dashboardRoutes);
app.use("/search", searchRoutes);
app.use("/channels", channelsRoutes);
app.use("/publisher", publisherRoutes);
app.use("/editor", editorRoutes);

app.use("/micro", dashboardRoutes);
app.use("/friends", friendsRoutes);
app.use("/myprofile", profileRoutes);
app.use("/r", readRoutes);

// Home route
app.get("/", (req, res) => {
  res.render("page", { title: "Express Auth App" });
});

app.get("/drafts_db", async (req, res) => {
  let user = null;
  /** settimeout 3mins and search for plid if the plid on content has all models in string then update status DRAFT_verify then end func */
 
      let chk_db_artcl = null;
      try {
        console.log("getDrafts ==========================");
        const postingblog = await getDrafts().then(async (vl) => {
          // get variables
                
          let { plid, content, id, results, processor, articleid } = vl[0];
          console.log(plid);
          console.log("vl==========================");
          console.log(vl);

          const sentences = content
            .split(".")
            .map((sentence) => sentence.trim())
            .filter((sentence) => sentence.length > 0);

          console.log(sentences.length);

          let prg_parts = sentences.length / 4;
          //prg_parts are number of sentences in 1 paragraph

          let pargph_1 = sentences.slice(0, prg_parts);
          let pargph_2 = sentences.slice(prg_parts + 1, prg_parts + prg_parts);
          let pargph_3 = sentences.slice(
            prg_parts + prg_parts,
            prg_parts + prg_parts + prg_parts
          );

          const art_prgph_1 = pargph_1.join(". ");
          const art_prgph_2 = pargph_2.join(". ");
          const art_prgph_3 = pargph_3.join(". ");

          console.log("==============art_prgph");

          let kl_llma = await fetch_kly1(
            plid,
            art_prgph_1,
            "klusterai/Meta-Llama-3.1-8B-Instruct-Turbo"
          )
            .then((v) => {
              console.log(v);
            })
            .catch(console.error);

          let kl_mist = await fetch_kly1(
            plid,
            art_prgph_2,
            "meta-llama/Llama-4-Scout-17B-16E-Instruct"
          )
            .then((v) => {
              console.log(v);
            })
            .catch(console.error);

          let kl_dsek = await fetch_kly1(
            plid,
            art_prgph_3,
            "mistralai/Mistral-Small-24B-Instruct-2501"
          )
            .then((v) => {
              console.log(v);
            })
            .catch(console.error);

          console.log("======kl_llma=true =====");
        });
      } catch (error) {

        console.log("Error!! Nothing to process @ drafts_db @app.js ", error);
      }
  
});

// 404 handler
app.use((req, res) => {
  res.status(404).render("404", { title: "Page Not Found" });
});

module.exports = app;
