export default function chooseLaw() {
    // Seleccionar el div con el ID específico
    const div_from_sidebar_id = "contentDisplayLista";
    const div = document.getElementById(div_from_sidebar_id);
    if (!div) return new Error("No existe el div con el id", div_from_sidebar_id);
  
    // Seleccionar el hijo del div
    const firstChild = div.firstElementChild;
    if (!firstChild) return 'Primer hijo no encontrado';
  
    // Seleccionar el hijo del primer hijo
    const secondChild = firstChild.firstElementChild;
    if (!secondChild) return 'Segundo hijo no encontrado';
  
    // Extraer los textContents
    return {
      divText: div.textContent,
      firstChildText: firstChild.textContent,
      secondChildText: secondChild.textContent
    };
  }
  