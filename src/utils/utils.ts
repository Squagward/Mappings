import * as fs from "fs";
import * as path from "path";

const classes: {
  [key: string]: {
    methods: { srg: string; mcp: string; desc: string }[];
    fields: { srg: string; mcp: string }[];
  };
} = {};

const parseClass = (line: string) => {
  const clazz = line.split(" ")[1];
  classes[clazz] = { methods: [], fields: [] };
};

const parseMethod = (line: string) => {
  const [obf, desc, deObf] = line.split(" ").slice(1);
  let splitter = obf.lastIndexOf("/");
  const clazz = obf.slice(0, splitter);
  const method = obf.slice(splitter + 1);

  splitter = deObf.lastIndexOf("/");
  const deObfMethod = deObf.slice(splitter + 1);

  classes[clazz].methods.push({ srg: method, mcp: deObfMethod, desc });
};

const parseField = (line: string) => {
  const [obf, deObf] = line.split(" ").slice(1);
  let splitter = obf.lastIndexOf("/");
  const clazz = obf.slice(0, splitter);
  const field = obf.slice(splitter + 1);

  if (field === "$VALUES") return;

  splitter = deObf.lastIndexOf("/");
  const deObfField = deObf.slice(splitter + 1, -1);

  classes[clazz].fields.push({ srg: field, mcp: deObfField });
};

const file = fs.readFileSync(
  path.resolve(__dirname, "../../assets/srg-mcp.srg"),
  "utf-8"
);

const lines = file.split("\n");

lines.forEach((line) => {
  if (line.startsWith("CL:")) {
    parseClass(line);
  } else if (line.startsWith("MD:")) {
    parseMethod(line);
  } else if (line.startsWith("FD:")) {
    parseField(line);
  }
});

fs.writeFileSync(
  path.resolve(__dirname, "../../assets/srg-mcp.json"),
  JSON.stringify(classes, null, 2)
);