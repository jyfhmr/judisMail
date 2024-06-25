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

    //recorrer todas las tablas



    /*
   console.log(await altosDecisiones.$(":nth-child(1)"))
   console.log(await altosDecisiones.$(":nth-child(2)"))
   console.log(await altosDecisiones.$(":nth-child(3)"))
   */
  
     /*
   const childrenHandles = await altosDecisiones.$$(':scope > table');
  // console.log("HIJOS DE altosDecisiones",childrenHandles)


   var dataASD = []
   for(let dateSelectors of  childrenHandles){

    const data = await page.evaluate((child) => {
      const monthElement = child.querySelector('.nombre-mes a');
      const firstDayElement = child.querySelector('.numero-dia');

      const month = monthElement ? monthElement.textContent.trim() : null;
      const firstDay = firstDayElement ? firstDayElement.textContent.trim() : null;
      
      return { month, firstDay };
    }, dateSelectors);
    dataASD.push(data)

    console.log("Mes:", data.month);
    console.log("Primer día:", data.firstDay);

    const data2 = await page.evaluate((child) => {
      return child
    }, dateSelectors);
    console.log("HIJOS",data2)

   }
   console.log("data multiplee",dataASD)
   */

   

    // PASO 5: Extraer el mes y el primer día
    const data = await page.evaluate(() => {
      const monthElement = document.querySelector(
        ":nth-child(1) > .alto.decisiones :nth-child(2) .nombre-mes a"
      );
      const firstDayElement = document.querySelector(
        ":nth-child(1) > .alto.decisiones :nth-child(2) .numero-dia"
      );

      const month = monthElement ? monthElement.textContent.trim() : null;
      const firstDay = firstDayElement
        ? firstDayElement.textContent.trim()
        : null;

      return { month, firstDay };
    });

    console.log("Mes:", data.month);
    console.log("Primer día:", data.firstDay);

    // PASO 6: Hacer clic en el primer enlace del día
    if (data.firstDay) {
      console.log("si existe");
      await page.evaluate(async () => {
        const firstDayElement = document.querySelector(
          ":nth-child(1) > .alto.decisiones :nth-child(2) .numero-dia"
        );
        await firstDayElement.click();
        console.log("le di click al <a>");
      });

      // Esperar a que el contenido cargue
      await page.waitForFunction(
        () => {
          const blog_area = document.querySelector("#blog_area");
          return (
            blog_area &&
            blog_area.children[1] &&
            blog_area.children[1].children.length > 0
          );
        },
        { timeout: 60000 }
      );

      // Extraer el contenido de las sentencias
      const content = await page.evaluate(() => {
        const sentences = [];
        const blog_area = document.querySelector("#blog_area");
        const sentences_cont = blog_area.children[1];

        for (let sentence of sentences_cont.children) {
          const table_of_sentence = sentence.children[0].children[0];
          sentences.push({
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

        return sentences;
      });

    

      var sentences_from_civil = {
        ...data,
        sentences: content
    }

   console.log("objeto final de sentencias",sentences_from_civil)

    }
  } catch (error) {
    console.error("Error en la ejecución:", error);
  } finally {
    //await browser.close();
  }
})();
