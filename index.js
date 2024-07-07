import puppeteer from "puppeteer";
import chooseLaw from "./services/chooseLaw.js"; // Importa tu función si la necesitas
import fs from "fs";
console.log("Inició");

var contador = 1
var salasData = []

async function pepe ()  {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("http://www.tsj.gob.ve/decisiones", { timeout: 60000 });
  await page.screenshot({ path: "example.png" });

  try {
    console.log("Iniciando Bucle...");

    // Sacar sidebar
    const sidebar = await page.waitForSelector("#contentDisplayLista", {
      timeout: 60000,
    });
    if (!sidebar)
      throw new Error("No existe el div con el id: contentDisplayLista");

    //Contenedor de divs
    const ul_from_sidebar = await sidebar.$(":nth-child(3)");
    if (!ul_from_sidebar)
      throw new Error("No existe el tercer hijo del div sidebar");

    //Sala Civil
    const civil = await ul_from_sidebar.$(`:nth-child(${contador})`);
    if (!civil) throw new Error("No existe el quinto hijo dentro del UL");

    //<a> de Civil
    const a_from_civil = await civil.$("a");
    const textContent = await page.evaluate(a => a.textContent, a_from_civil);
    if (!a_from_civil)
      throw new Error("No existe el elemento a en el hijo civil");

    await a_from_civil.click();
    console.log("CLICKED");

    // PASO 2: Esperar a que el nuevo elemento aparezca
    const containerDisplaySent = await page.waitForSelector(
      "#containerDisplaySent",
      { timeout: 60000 }
    );
    if (!containerDisplaySent)
      throw new Error("No existe el div con el id: containerDisplaySent");

    // PASO 3: Acceder a los divs anidados
    const bsection = await containerDisplaySent.$(":nth-child(1)");
    if (!bsection)
      throw new Error("No existe el div con la clase: .bsection.cf");

    const altosDecisiones = await bsection.$(":nth-child(1)");
    if (!altosDecisiones)
      throw new Error("No existe el div con la clase: .alto.decisiones");

    // PASO 4: Esperar a que el innerHTML de altosDecisiones no esté vacío usando page.waitForFunction
    await page.waitForFunction(
      (selector) => {
        const element = document.querySelector(selector);
        return element && element.innerHTML.trim().length > 0;
      },
      {},
      ":nth-child(1) > .alto.decisiones"
    );

    //recorre Toda la sala
    const childElements = await page.evaluate(async (container) => {
      console.log("el container", container);

      var salaSentences = [];

      const children = container.children;
      console.log("container children", children);

      //recorre todo el mes
      for (let i = 1; i < children.length; i++) {
        const listOfDaysPerMonth =
          children[i].children[0].children[0].children[1];

        let mesExtracted =
          children[i].children[0].children[0].children[0].textContent;

        var sentences = [mesExtracted, []];

        for (let i = 0; i < listOfDaysPerMonth.children.length; i++) {
          console.log(listOfDaysPerMonth.children[i]);

          let a = listOfDaysPerMonth.children[i];
          let day = a.textContent;

          var sentencesSeparator = [day, []];

          a.click();

          await new Promise((resolve) => setTimeout(resolve, 3000)); // Espera para permitir que el contenido se cargue

          const content = document.querySelector("#blog_area");
          const sentences_cont = content.children[1];

          console.log("SENTNECE CONT", sentences_cont);

          //Saca todas las sentencias de una fecha
          for (let sentence of sentences_cont.children) {
            console.log("llegó hasta aqui");

            const table_of_sentence = sentence.children[0].children[0];

            console.log("llegó hasta aqui 2")

            sentence_number = table_of_sentence.children[0].children[0].children[0].children[0].children[0].children[0].textContent.trim() ? table_of_sentence.children[0].children[0].children[0].children[0].children[0].children[0].textContent.trim() : "No Disponible"
            console.log("llegó hasta aqui 3")
            
            proceedings_number = table_of_sentence.children[0].children[0].children[1].children[0].children[0].textContent.trim() ? table_of_sentence.children[0].children[0].children[1].children[0].children[0].textContent.trim() : "No Disponible"
            console.log("llegó hasta aqui 4")
            
            proceedings_type = table_of_sentence.children[1].children[0].children[0].textContent.trim() ? table_of_sentence.children[1].children[0].children[0].textContent.trim() : "No Disponible"
            console.log("llegó hasta aqui 5")
            
            parts = table_of_sentence.children[1].children[1].children[0].textContent.trim() ? table_of_sentence.children[1].children[1].children[0].textContent.trim() : "No Disponible"
            console.log("llegó hasta aqui 6")
            
            choice = table_of_sentence.children[1].children[2].children[0].textContent.trim() ? table_of_sentence.children[1].children[2].children[0].textContent.trim() : "No Disponible"
            console.log("llegó hasta aqui 7")
            
            speaker = table_of_sentence.children[1].children[3].children[0].textContent.trim() ? table_of_sentence.children[1].children[3].children[0].textContent.trim() : "No Disponible"
            console.log("llegó hasta aqui 8")
            
            url_content = table_of_sentence.children[1].children[4] 
              ? table_of_sentence.children[1].children[4].children[0].children[1].href 
              : "No Disponible"

            console.log("llegó hasta aqui 9");

            sentencesSeparator[1].push({
              sentence_number,
              proceedings_number,
              proceedings_type,
              parts,
              choice,
              speaker,
              url_content,
            });
          }

          console.log("llegó hasta aqui ultimo");

          sentences[1].push(sentencesSeparator);

          console.log("SENTNECIA DE MES COMPLETO", sentences);
        }

        salaSentences.push(sentences);
      }

      console.log("SENTENCIA DE SALA", salaSentences);
      return salaSentences
    }, altosDecisiones);

    salasData.push(textContent,childElements)


  } catch (error) {
    console.error("Error en la ejecución:", error);
  } finally {

    contador++
   if(contador <= 7){
    pepe()
    console.log("SALAS DATA",salasData)
  await browser.close();
   }else{
    fs.writeFile("salasData.js", `const salasData = ${JSON.stringify(salasData, null, 2)};`, (err) => {
      if (err) throw err;
      console.log("El archivo salasData.js ha sido guardado!");
    });
   }
   
  }
};

pepe()