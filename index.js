import puppeteer from "puppeteer";
import chooseLaw from "./services/chooseLaw.js"; // Importa tu función si la necesitas

console.log("Inició");

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("http://www.tsj.gob.ve/decisiones", { timeout: 60000 });
  await page.screenshot({ path: "example.png" });

  try {
    console.log("buscando");

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
    const civil = await ul_from_sidebar.$(":nth-child(5)");
    console.log("CIVIL",civil)
    if (!civil) throw new Error("No existe el quinto hijo dentro del UL");

    //<a> de Civil
    const a_from_civil = await civil.$("a");
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


  ;
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

   
   //recorre todo el mes
   const childElements = await page.evaluate(async(container) => {
    const children = container.children;
    const listOfDaysPerMonth = children[1].children[0].children[0].children[1]
  
    var sentences = []

    for(let i = 0; i < listOfDaysPerMonth.children.length; i++){
      console.log(listOfDaysPerMonth.children[i])

      var sentencesSeparator = []
     
    
      let a = listOfDaysPerMonth.children[i]

      let day = a.textContent

      a.click()

      await new Promise((resolve) => setTimeout(resolve, 3000)); // Espera para permitir que el contenido se cargue

      const content = document.querySelector("#blog_area");
      const sentences_cont = blog_area.children[1];

      console.log("SENTNECE CONT",sentences_cont)

      for (let sentence of sentences_cont.children) {
        const table_of_sentence = sentence.children[0].children[0];
        sentencesSeparator.push({
          sentence_number:
            table_of_sentence.children[0].children[0].children[0].children[0].children[0].children[0].textContent.trim(),
          proceedings_number:
            table_of_sentence.children[0].children[0].children[1].children[0].children[0].textContent.trim(),

          proceedings_type: table_of_sentence.children[1].children[0].children[0].textContent.trim(),

          parts: table_of_sentence.children[1].children[1].children[0].textContent.trim(),

          choice: table_of_sentence.children[1].children[2].children[0].textContent.trim(),

          speaker: table_of_sentence.children[1].children[3].children[0].textContent.trim(),

          url_content: table_of_sentence.children[1].children[4].children[0].children[1].href

        });
      }
    
      sentences.push(sentencesSeparator)
    
   
  
    }
    console.log(sentences)
  }, altosDecisiones)
   



  } catch (error) {
    console.error("Error en la ejecución:", error);
  } finally {
    //await browser.close();
  }
})();
