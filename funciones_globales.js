/*Autor: Diego Pacheco Prado Email: dpacheco@uazuay.edu.ec/diepacpr@upv.es*/

/*Exportar archivos a carpeta de google drive
archivo_exportar: nombre del archivo Image a exportar
nombre: nombre que asume el archivo nuevo
carpeta: nombre de la carpeta donde se almacenará el archivo
region: area para recorte del archivo
tamano_pixel: tamaño en m de pixel
*/
exports.st_exportar_archivo= function(archivo_exportar,nombre, carpeta, region, tamano_pixel)
{
  var currentDate = new Date();
  var day = currentDate.getDate();
  var month = currentDate.getMonth() + 1;
  var year = currentDate.getFullYear();
  var dia=year + "_" + month + "_" + day;
  Export.image.toDrive({
    image: archivo_exportar,
    scale: tamano_pixel,
    folder : carpeta,
     fileFormat: 'GeoTIFF',
      crs: 'EPSG:32717',
     maxPixels: 1e9,
    region: region,
    description: 'raster_'+nombre+'_generado'+dia 
  });
  return "Archivo " + "raster_" + nombre + "_generado" + dia +  " guardado";
}

/*Exportar tablas a carpeta de google drive
tabla: nombre de la tabla a exportar
carpeta: nombre de la carpeta donde se almacenará el archivo
nombre: nombre que asume el archivo nuevo
*/
exports.st_matriz_confusion_csv= function(tabla, carpeta,nombre)
{
  var exportAccuracy = ee.Feature(null, {matrix: tabla.array()});
  
  // Export the FeatureCollection.
  Export.table.toDrive({
    collection: ee.FeatureCollection(exportAccuracy),
    folder : carpeta,
    description: nombre,
    fileFormat: 'CSV'
  });
  return "Tabla "+nombre+" guardada.";
}

/*Exportar una tabla de datos en formato KML */ 
exports.st_exportar_tabla_kml=function(coleccion, carpeta, nombre)
{
  var currentDate = new Date();
  var day = currentDate.getDate();
  var month = currentDate.getMonth() + 1;
  var year = currentDate.getFullYear();
  var dia=year + "_" + month + "_" + day;

  Export.table.toDrive({
  folder : carpeta,
  collection: coleccion,
  description: 'tabla_'+nombre+'_generado'+dia, 
  fileFormat: 'KML'
  });
  return 'tabla_'+nombre+'_generado'+dia + " almacenado."
}

/*Sumar o restar días a una fecha enviada */
/*
fecha_consulta: la fecha donde se detectó que existe una imagen
dias: cantidad de días a sumar o restar
*/
exports.st_nueva_fecha=function(fecha_consulta, dias)
{
  var fecha = new Date(fecha_consulta);
  fecha.setDate(fecha.getDate() + dias);
  var f_fecha= fecha.getFullYear() + "-" + (fecha.getMonth()+1) + "-" + (fecha.getDate()+1);
  return f_fecha;
}

exports.st_dia_inicial=function(fecha_consulta)
{
  var fecha = new Date(fecha_consulta);
  var f_fecha= fecha.getFullYear() + "-" + (fecha.getMonth()+1) + "-01";
  return f_fecha;
}

exports.st_dia_final=function(fecha_consulta)
{
   var fecha = new Date(fecha_consulta);
   var y= fecha.getFullYear();
   var m=(fecha.getMonth()+2);
   var f_fecha= new Date(y +"-"+ (m) + "-1");
   var f2=exports.st_nueva_fecha(f_fecha,-1);
  return f2.getFullYear()+"-"+(f2.getMonth()+1) +"-"+ f2.getDate();
}

exports.MascaraNubesS=function(image) {
  var qa = image.select('QA60');
  //Excluimos los pixel identificados como nubes y cirros de la imagen
  var RecorteNubesMascaraS = 1 << 10;
  var RecorteCirrosMascaraS = 1 << 11;
  var MascaraS = qa.bitwiseAnd(RecorteNubesMascaraS).eq(0)
      .and(qa.bitwiseAnd(RecorteCirrosMascaraS).eq(0));
  return image.updateMask(MascaraS);
}
  
exports.st_ImagenS2fechas=function(fechas_consulta,borde) {

fechas_consulta.forEach(function(entry) {
    finicio=f.st_nueva_fecha(entry,-2);
    ffinal=f.st_nueva_fecha(entry,2);
    S2 = ee.ImageCollection('COPERNICUS/S2_SR')
    .filterDate(finicio, ffinal)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 100))
    .filterBounds(borde)
    .map(MascaraNubesS)
    .map(function(image){return image.clip(borde)});

    if (r_union===null)
    {r_union=S2}
    else
    {r_union = r_union.merge(S2)}
    
});
S2=r_union;
return r_union;
}

