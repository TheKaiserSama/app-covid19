const casosRecuperados = document.querySelector(".casos-recuperados-count");
const casosFellecidos = document.querySelector(".casos-fallecidos-count");
const casosNa = document.querySelector(".casos-na-count");
const ciudades = document.querySelector("#ciudades");
const tiposRecuperacion = document.querySelector("#tipo-recuperacion");
const tablapacientes = document.querySelector(".tabla-pacientes");
const totalTamanio = document.querySelector("#total");
const pagina = document.querySelector("#pagina");
const siguiente = document.querySelector("#siguiente");
const anterior = document.querySelector("#anterior");



let listaciudades = [];
let listaTiposRecuperacion = [];
let listaPacientes = [];

let paginacion = {
  tamanio: 10,
  total: 0,
  pagina: 1
}
const filtrosBusqueda = {
  ciudad: '',
  tipoRecuperacion: ''
};

function actualizarCasos(pacientes){

  let cantidadCasosRecuperados = 0;
  let cantidadCasosFallecidos = 0;
  let cantidadCasosNa = 0;

  pacientes.forEach(paciente => {
    if(paciente.recuperado === "Recuperado"){
      cantidadCasosRecuperados ++;
    }else if(paciente.recuperado === "Fallecido"){
      cantidadCasosFallecidos ++;
    }else{
      cantidadCasosNa ++ ;
    }
    
  });
  casosRecuperados.innerHTML = cantidadCasosRecuperados;
  casosFellecidos.innerHTML = cantidadCasosFallecidos;
  casosNa.innerHTML = cantidadCasosNa;
}

function obtenerDatosSelect(pacientes){
  pacientes.forEach(paciente => {
    const {ciudad_municipio_nom:ciudad, tipo_recuperacion:tipoRecuperacion } = paciente;
    if (!listaciudades.includes(ciudad) && ciudad){
      listaciudades.push(ciudad);
    }

    if(!listaTiposRecuperacion.includes(tipoRecuperacion) && tipoRecuperacion){
      listaTiposRecuperacion.push(tipoRecuperacion)
    }
    
  });
  cargarSelect(listaciudades, ciudades);
  cargarSelect(listaTiposRecuperacion, tiposRecuperacion);
}

function cargarSelect(lista, elementHTML){
  lista.sort();
  let opciones = "";
  lista.forEach(valor => {

    opciones += `<option value="${valor}" > ${valor}</option>`
    
  });

  elementHTML.insertAdjacentHTML("beforeend", opciones);
}
function filtrarPacientes(){
  const data = listaPacientes
    .filter(filtrarPorCiudad)
    .filter(filtrarPorTipoRecuperacion);
  return data;
}

function filtrarPorCiudad (paciente) {
  if(filtrosBusqueda.ciudad){
    return paciente.ciudad_municipio_nom === filtrosBusqueda.ciudad;
  }
  return paciente;
}

function filtrarPorTipoRecuperacion (paciente) {
  if(filtrosBusqueda.tipoRecuperacion){
    return paciente.tipo_recuperacion === filtrosBusqueda.tipoRecuperacion;
  }
  return paciente;

}

function mostrarTabla(){
  let filas = `
    <tr id="encabezados">${document.querySelector("#encabezados").innerHTML}</tr>   
  `;

  const pacientesAux = filtrarPacientes();
  actualizarCasos(pacientesAux);
  const {tamanio, pagina} = paginacion;
  paginacion.total = Math.ceil(pacientesAux.length / tamanio);
  totalTamanio.innerHTML = paginacion.total;
  const length = tamanio * pagina > pacientesAux.length ? pacientesAux.length: tamanio * pagina;

  for (let index = (pagina-1)*tamanio; index < length; index++) {
    const {
      ciudad_municipio_nom:ciudad,
      edad,
      sexo,
      recuperado,
      tipo_recuperacion: tipoRecuperacion,
      fecha_inicio_sintomas: fechaInicioSintomas,
      fecha_diagnostico: fechaDiagnostico } = pacientesAux[index];
    
    let fecha1 = new Date(fechaInicioSintomas);
    let fecha2 = new Date(fechaDiagnostico);
    let diferencia = (Math.abs(fecha2 - fecha1 )) / (1000 * 3600 * 24);
    let datoFechaInicioSintomas = fecha1.toISOString().split("T")[0];
    let datoFechaDiagnostico = fecha2.toISOString().split("T")[0];
    const fila = `
      <tr>
        <td>${ciudad}</td>
        <td>${edad}</td>
        <td>${sexo}</td>
        <td>${recuperado}</td>
        <td>${tipoRecuperacion}</td>
        <td>${datoFechaInicioSintomas}</td>
        <td>${datoFechaDiagnostico}</td>
        <td>${diferencia} dias</td>
      </tr>
    `;

    filas += fila;
    
  }
  tablapacientes.innerHTML = filas;

}

//Eventos

ciudades.addEventListener('change', (e) => {
  paginacion.pagina = 1;
  anterior.disabled = true;
  pagina.innerHTML = paginacion.pagina;

  filtrosBusqueda.ciudad = e.target.value;  
  mostrarTabla();
});

tiposRecuperacion.addEventListener('change', (e) => {
  paginacion.pagina = 1;
  anterior.disabled = true;
  pagina.innerHTML = paginacion.pagina;

  filtrosBusqueda.tipoRecuperacion = e.target.value;
  mostrarTabla();
}); 

anterior.addEventListener('click', (e) =>{
  paginacion.pagina --;
  
  if(paginacion.pagina <=1){
    anterior.disabled = true;
  }
  siguiente.disabled = false;
  pagina.innerHTML = paginacion.pagina;
  mostrarTabla();

});

siguiente.addEventListener('click', (e)=>{
  paginacion.pagina ++;

  if(paginacion.pagina >= paginacion.total){
    siguiente.disabled = true;
  }
  anterior.disabled = false;
  pagina.innerHTML = paginacion.pagina;
  mostrarTabla();
});

fetch("https://www.datos.gov.co/resource/gt2j-8ykr.json")
  .then( response => response.json())
  .then( pacientes => {
    paginacion.total = Math.ceil(pacientes.length / paginacion.tamanio);
    listaPacientes = pacientes;
    actualizarCasos(pacientes);
    obtenerDatosSelect(pacientes);   
    totalTamanio.innerHTML = paginacion.total;
    
    mostrarTabla();
    
  })
  .catch( error => console.log("Error al cargar los datos", error));