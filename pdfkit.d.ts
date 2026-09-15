/**
 * pdfkit n'a pas de types officiels à jour pour cette version — on le
 * traite en `any` plutôt que d'installer @types/pdfkit (qui traîne
 * plusieurs versions de retard) pour éviter tout risque de décalage.
 */
declare module "pdfkit" {
  const PDFDocument: any;
  export default PDFDocument;
}
