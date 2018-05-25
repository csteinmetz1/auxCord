import * as shell from "shelljs";

shell.cp("-R", "src/public/", "dist/public/");
shell.cp("-R", "src/views/", "dist/public/");
shell.mkdir("-p", "dist/data")