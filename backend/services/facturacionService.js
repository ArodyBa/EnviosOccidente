/**
 * felService.js
 * Servicio para gestionar la Factura Electrónica en Línea (FEL) de Guatemala
 */
const { promisePool } = require("../config/db");
const xml2js = require('xml2js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { Console } = require('console');
const { configDotenv } = require("dotenv");

class facturacionService {
  constructor() {
    this.config = {
      usuario: process.env.FEL_USUARIO || 'tekra_api',
      clave: process.env.FEL_CLAVE || '123456789',
      cliente: process.env.FEL_CLIENTE || '2121010001',
      contrato: process.env.FEL_CONTRATO || '2122010001',
      id_origen: "demo",
      ip_origen: "127.0.0.1",
      firmar_emisor: "1",
      validar_identificador: "Si",
      urlCertificacion: process.env.FEL_URL || 'http://apicertificacion.desa.tekra.com.gt:8080/certificacion/servicio.php'
    };
  }


  /**************************************************************************************************************************************************/
  /**
   * Crea el XML del DTE para FEL Guatemala
   * @param {Object} datosFactura - Datos de la factura a generar
   * @returns {String} XML generado
   */
  crearXmlFel(datosFactura) {
    // Creamos un objeto builder de xml2js con las opciones necesarias
    const builder = new xml2js.Builder({
      xmldec: { version: '1.0', encoding: 'UTF-8' },
      renderOpts: {
        pretty: true,
        indent: '  ',
        newline: '\n'
      },
      headless: false, // Para incluir la declaración XML
      // rootName: 'dte:GTDocumento' // Nombre del elemento raíz
    });

    // Definimos los namespaces requeridos por SAT
    const namespaces = {
      'Version': '0.1',
      'xmlns:dte': 'http://www.sat.gob.gt/dte/fel/0.2.0',
      'xmlns:cfc': 'http://www.sat.gob.gt/dte/fel/CompCambiaria/0.1.0',
      'xmlns:cex': 'http://www.sat.gob.gt/face2/ComplementoExportaciones/0.1.0',
      'xmlns:cfe': 'http://www.sat.gob.gt/face2/ComplementoFacturaEspecial/0.1.0',
      'xmlns:cno': 'http://www.sat.gob.gt/face2/ComplementoReferenciaNota/0.1.0',
      'xmlns:ds': 'http://www.w3.org/2000/09/xmldsig#',
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
    };

    // Extraemos datos de la factura o usamos valores por defecto
    const {
      nitEmisor = '107346834',
      nombreEmisor = 'TEKRA SOCIEDAD ANONIMA',
      codigoEstablecimiento = '1',
      nombreComercial = 'TEKRA SOCIEDAD ANONIMA',
      correoEmisor = '',
      nitReceptor = datosFactura.nitReceptor,
      nombreReceptor = datosFactura.nombreReceptor,
      correoReceptor = 'receptor@mail.com',
      Direccion_Receptor = 'Guatemala',
      CodigoPostal_Receptor = '0',
      Municipio_Receptor = '1',
      Departamento_Receptor = '5',
      Pais_Receptor = 'GT',
      items = [
        {
          descripcion: 'Descripción Item',
          cantidad: 1,
          precioUnitario: 10
        }
      ]
    } = datosFactura || {};

    // Calculamos los totales
    let montoImpuesto = 0;
    let granTotal = 0;

    const itemsXml = items.map((item, index) => {
      const precio = parseFloat(item.precioUnitario) * parseFloat(item.cantidad);
      const montoGravable = (precio / 1.12).toFixed(5);
      const impuesto = (precio - montoGravable).toFixed(5);

      montoImpuesto += parseFloat(impuesto);
      granTotal += precio;

      return {
        '$': {
          'NumeroLinea': (index + 1).toString(),
          'BienOServicio': item.bienOServicio.toString(),
        },
        'dte:Cantidad': item.cantidad.toString(),
        'dte:Descripcion': item.descripcion,
        'dte:PrecioUnitario': item.precioUnitario.toString(),
        'dte:Precio': precio.toString(),
        'dte:Descuento': item.precioDescuento.toString(),
        'dte:Impuestos': {
          'dte:Impuesto': {
            'dte:NombreCorto': 'IVA',
            'dte:CodigoUnidadGravable': '1',
            'dte:MontoGravable': montoGravable,
            'dte:MontoImpuesto': impuesto
          }
        },
        'dte:Total': precio.toString()
      };
    });

    // Creamos la estructura del DTE según documentación
    const dteObj = {
      'dte:GTDocumento': {
        '$': namespaces,
        'dte:SAT': {
          '$': {
            'ClaseDocumento': 'dte'
          },
          'dte:DTE': {
            '$': {
              'ID': 'DatosCertificados'
            },
            'dte:DatosEmision': {
              '$': {
                'ID': 'DatosEmision'
              },
              'dte:DatosGenerales': {
                '$': {
                  'Tipo': 'FACT',
                  'FechaHoraEmision': new Date().toISOString(),
                  'CodigoMoneda': 'GTQ',
                  // 'NumeroAcceso': Math.floor(Math.random() * 1000000000).toString()
                }
              },
              'dte:Emisor': {
                '$': {
                  'NITEmisor': nitEmisor,
                  'NombreEmisor': nombreEmisor,
                  'CodigoEstablecimiento': codigoEstablecimiento,
                  'NombreComercial': nombreComercial,
                  'CorreoEmisor': correoEmisor,
                  'AfiliacionIVA': 'GEN'
                },
                'dte:DireccionEmisor': {
                  'dte:Direccion': 'Guatemala',
                  'dte:CodigoPostal': '01010',
                  'dte:Municipio': 'Guatemala',
                  'dte:Departamento': 'GUATEMALA',
                  'dte:Pais': 'GT'
                }
              },
              'dte:Receptor': {
                '$': {
                  'IDReceptor': nitReceptor,
                  'NombreReceptor': nombreReceptor,
                  'CorreoReceptor': correoReceptor
                },
                'dte:DireccionReceptor': {
                  'dte:Direccion': Direccion_Receptor,
                  'dte:CodigoPostal': CodigoPostal_Receptor,
                  'dte:Municipio': Municipio_Receptor,
                  'dte:Departamento': Departamento_Receptor,
                  'dte:Pais': Pais_Receptor
                }
              },
              'dte:Frases': {
                'dte:Frase': {
                  '$': {
                    'TipoFrase': '1',
                    'CodigoEscenario': '1'
                  }
                }
              },
              'dte:Items': {
                'dte:Item': itemsXml
              },
              'dte:Totales': {
                'dte:TotalImpuestos': {
                  'dte:TotalImpuesto': {
                    '$': {
                      'NombreCorto': 'IVA',
                      'TotalMontoImpuesto': montoImpuesto.toFixed(5)
                    }
                  }
                },
                'dte:GranTotal': granTotal.toFixed(5)
              }
            }
          },
          'dte:Adenda': {
            'DECertificador': '99999'
          }
        }
      }
    };

    // Convertimos el objeto a XML
    const xml = builder.buildObject(dteObj);

    return xml;
  }

  /**************************************************************************************************************************************************/
  /**
   * Crea la solicitud SOAP con el XML de DTE
   * @param {String} xmlDTE - XML del DTE
   * @returns {String} Solicitud SOAP completa
   */
  crearSolicitudSOAP(xmlDTE) {
    // Datos de autenticación
    const autenticacion = `
      <Autenticacion>
        <pn_usuario>${this.config.usuario}</pn_usuario>
        <pn_clave>${this.config.clave}</pn_clave>
        <pn_cliente>${this.config.cliente}</pn_cliente>
        <pn_contrato>${this.config.contrato}</pn_contrato>
        <pn_id_origen>${this.config.id_origen}</pn_id_origen>
        <pn_ip_origen>${this.config.ip_origen}</pn_ip_origen>
        <pn_firmar_emisor>${this.config.firmar_emisor}</pn_firmar_emisor>
      </Autenticacion>
    `;

    // Encapsulamos el XML del DTE en un CDATA para la solicitud SOAP
    const documento = `
      <Documento>
        <![CDATA[${xmlDTE}]]>
      </Documento>
    `;

    // Construimos la solicitud SOAP completa
    const soapEnvelope = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:urn="http://apicertificacion.desa.tekra.com.gt:8080/certificacion/wsdl/">
        <soapenv:Header/>
        <soapenv:Body>
          <urn:CertificacionDocumento>
            ${autenticacion}
            ${documento}
          </urn:CertificacionDocumento>
        </soapenv:Body>
    </soapenv:Envelope>
    `;

    return soapEnvelope;
  }


  /**************************************************************************************************************************************************/
  /**
   * Envía la solicitud al servicio web SOAP
   * @param {String} soapEnvelope - Solicitud SOAP
   * @returns {Promise<String>} Respuesta del servicio web
   */
  async enviarSolicitudSOAP(soapEnvelope) {
    try {
      const response = await axios.post(
        this.config.urlCertificacion,
        soapEnvelope,
        {
          headers: {
            'Content-Type': 'text/xml;charset=UTF-8',
            'SOAPAction': '',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al enviar la solicitud SOAP:', error);
      throw error;
    }
  }


  /**************************************************************************************************************************************************/
  /**
   * Procesa la respuesta SOAP y extrae la información relevante
   * @param {String} respuestaSOAP - Respuesta SOAP completa
   * @returns {Promise<Object>} Información procesada
   */
  async procesarRespuestaSOAP(respuestaSOAP) {
    try {

      const parser = new xml2js.Parser({ explicitArray: false });
      const result = await new Promise((resolve, reject) => {
        parser.parseString(respuestaSOAP, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      // Navegamos por la estructura de la respuesta SOAP para obtener los datos relevantes
      const response = result['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:CertificacionDocumentoResponse'];

      // Parseamos el JSON que viene como string en ResultadoCertificacion
      const resultadoCertificacion = JSON.parse(response.ResultadoCertificacion);

      const resultDocCertificado = await new Promise((resolve, reject) => {
        parser.parseString(response.DocumentoCertificado, (err, result) => {
          if (err) reject(err);
          else resolve(result);
          //// const DocumentoCertificadoJson =  JSON.stringify(result, null, 2);
        });
      });
      const totalImpuesto = resultDocCertificado['dte:GTDocumento']['dte:SAT']['dte:DTE']['dte:DatosEmision']['dte:Totales']['dte:TotalImpuestos']['dte:TotalImpuesto']['$']['TotalMontoImpuesto'];
      const granTotal = resultDocCertificado['dte:GTDocumento']['dte:SAT']['dte:DTE']['dte:DatosEmision']['dte:Totales']['dte:GranTotal'];
      const nitReceptor = resultDocCertificado['dte:GTDocumento']['dte:SAT']['dte:DTE']['dte:DatosEmision']['dte:Receptor']['$']['IDReceptor'];

      // Construimos el objeto de resultado
      const resultadoFinal = {
        error: resultadoCertificacion.error,
        frases: resultadoCertificacion.frases || [],
        mensajes_marcas: resultadoCertificacion.mensajes_marcas || [],
        errores_xsd: resultadoCertificacion.errores_xsd,
        documentoCertificado: response.DocumentoCertificado,
        documentoCertificadoJson: resultDocCertificado,
        representacionGrafica: response.RepresentacionGrafica,
        codigoQR: response.CodigoQR,
        NITCertificador: response.NITCertificador,
        NombreCertificador: response.NombreCertificador,
        NumeroAutorizacion: response.NumeroAutorizacion,
        NumeroDocumento: response.NumeroDocumento,
        SerieDocumento: response.SerieDocumento,
        FechaHoraEmision: response.FechaHoraEmision,
        FechaHoraCertificacion: response.FechaHoraCertificacion,
        NombreReceptor: response.NombreReceptor,
        EstadoDocumento: response.EstadoDocumento,
        GranTotal: granTotal,
        TotalImpuesto: totalImpuesto,
        NitReceptor: nitReceptor,
        exitoso: resultadoCertificacion.error === 0
      };

      return resultadoFinal;
    } catch (error) {
      console.error('Error al procesar la respuesta SOAP:', error);
      return {
        exitoso: false,
        error: error.message
      };
    }
  }


  /**************************************************************************************************************************************************/
  /**
   * Guarda archivos XML para depuración o auditoría
   * @param {String} nombreArchivo - Nombre base del archivo
   * @param {String} contenido - Contenido a guardar
   * @returns {String} Ruta completa donde se guardó el archivo
   */
  guardarArchivo(nombreArchivo, contenido) {
    try {
      const directorio = path.join(__dirname, '../fel/archivos');

      // Crear directorio si no existe
      if (!fs.existsSync(directorio)) {
        fs.mkdirSync(directorio, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const rutaArchivo = path.join(directorio, `${nombreArchivo}-${timestamp}.xml`);

      fs.writeFileSync(rutaArchivo, contenido);
      return rutaArchivo;
    } catch (error) {
      console.error(`Error al guardar el archivo ${nombreArchivo}:`, error);
      return null;
    }
  }

  /**************************************************************************************************************************************************/
  /**
   * Guarda archivos XML para depuración o auditoría
   * @param {String} nombreArchivo - Nombre base del archivo
   * @param {String} contenido - Contenido a guardar
   * @returns {String} Ruta completa donde se guardó el archivo
   */
  async crearRegistroFactura(resultado, datosFactura) {
    const {
      id_venta = datosFactura.id_venta || 2,
      uuid = resultado.NumeroAutorizacion,
      serie = resultado.SerieDocumento,
      numero_documento = resultado.NumeroDocumento,
      fecha_certificacion = resultado.FechaHoraCertificacion,
      fecha_emision = resultado.FechaHoraEmision,
      estado = resultado.EstadoDocumento,
      xml_enviado = "",
      xml_certificado = resultado.documentoCertificado,
      pdf_base64 = resultado.representacionGrafica,
      nit_cliente = resultado.NitReceptor
    } = resultado;

    try {
      const [result] = await promisePool.query(
        `INSERT INTO documentos_fel (
          id_venta, uuid, serie, numero_documento, fecha_certificacion, fecha_emision, 
          estado, xml_enviado, xml_certificado, pdf_base64, nit_cliente
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id_venta, uuid, serie, numero_documento, fecha_certificacion, fecha_emision,
          estado, xml_enviado, xml_certificado, pdf_base64, nit_cliente
        ]
      );
      console.log(result);
      const resultadoFinal = {
        exitoso: result.affectedRows > 0,
        message: "Factura Guardada exitosamente"
      };

      return resultadoFinal;
    } catch (error) {
      console.error('Error no es posible Guardar la Factura!', error);
      return {
        exitoso: false,
        error: error.message
      };
    }
  }


  /**************************************************************************************************************************************************/
  /**
   * Proceso completo de certificación de documento FEL
   * @param {Object} datosFactura - Datos de la factura a certificar
   * @param {Boolean} modoDebug - Si es true, guarda los archivos XML
   * @returns {Promise<Object>} Resultado de la certificación
   */
  async certificarDocumento(datosFactura, modoDebug = false) {
    try {
      // 1. Crear el XML del DTE
      console.log('Generando el XML del DTE...');
      const xmlDTE = this.crearXmlFel(datosFactura);

      if (modoDebug) {
        this.guardarArchivo('dte', xmlDTE);
      }
      // console.log(xmlDTE);
      // 2. Crear la solicitud SOAP
      console.log('Creando la solicitud SOAP...');
      const soapEnvelope = this.crearSolicitudSOAP(xmlDTE);
      console.log(soapEnvelope);

      if (modoDebug) {
        this.guardarArchivo('solicitud-soap', soapEnvelope);
      }

      // 3. Enviar la solicitud al servicio web
      console.log('Enviando la solicitud al servicio web...');
      const respuestaSOAP = await this.enviarSolicitudSOAP(soapEnvelope);

      if (modoDebug) {
        this.guardarArchivo('respuesta-soap', respuestaSOAP);
      }

      // 4. Procesar la respuesta
      console.log('Procesando la respuesta...');
      const resultado = await this.procesarRespuestaSOAP(respuestaSOAP);

      if (resultado.exitoso) {
        const resultadocrearRegistroFactura = await this.crearRegistroFactura(resultado, datosFactura);
      }

      return resultado;
    } catch (error) {
      console.error('Error en el proceso de certificación:', error);
      return {
        exitoso: false,
        error: error.message
      };
    }
  }


  /**************************************************************************************************************************************************/
  async parsearRespuestaCompleta(respuestaSOAP) {
    return new Promise((resolve, reject) => {
      const parser = new xml2js.Parser({ explicitArray: false });
      parser.parseString(respuestaSOAP, (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          // Navegamos por la estructura de la respuesta SOAP para obtener los datos relevantes
          const response = result['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:CertificacionDocumentoResponse'];

          // Parseamos el JSON que viene como string en ResultadoCertificacion
          const resultadoCertificacion = JSON.parse(response.ResultadoCertificacion);

          // Construimos el objeto de resultado
          const resultadoFinal = {
            error: resultadoCertificacion.error,
            frases: resultadoCertificacion.frases,
            mensajes_marcas: resultadoCertificacion.mensajes_marcas,
            errores_xsd: resultadoCertificacion.errores_xsd,
            documentoCertificado: response.DocumentoCertificado,
            representacionGrafica: response.RepresentacionGrafica,
            // Podríamos extraer más datos si están disponibles
          };

          resolve(resultadoFinal);
        } catch (e) {
          reject(new Error('Error al procesar la estructura de la respuesta: ' + e.message));
        }
      });
    });
  }

  /**************************************************************************************************************************************************/
  /**
   * Proceso completo de certificación de documento FEL
   * @param {Object} datosFactura - Datos de la factura a certificar
   * @param {Boolean} modoDebug - Si es true, guarda los archivos XML
   * @returns {Promise<Object>} Resultado de la certificación
   */
  async anularDocumento(datosFactura, modoDebug = true) {
    try {
      // 1. Crear el XML del DTE
      console.log('Generando el XML del DTE...');
      const xmlDTE = this.crearXmlFelAnulacion(datosFactura);

      if (modoDebug) {
        this.guardarArchivo('dte', xmlDTE);
      }
      //console.log(xmlDTE);
      // 2. Crear la solicitud SOAP
      console.log('Creando la solicitud SOAP...');
      const soapEnvelope = this.crearSolicitudAnulacionSOAP(xmlDTE);
      console.log(soapEnvelope);

      if (modoDebug) {
        this.guardarArchivo('solicitud-soap', soapEnvelope);
      }

      // 3. Enviar la solicitud al servicio web
      console.log('Enviando la solicitud al servicio web...');
      const respuestaSOAP = await this.enviarSolicitudAnulacionSOAP(soapEnvelope);

      if (modoDebug) {
        this.guardarArchivo('respuesta-soap', respuestaSOAP);
      }

      // 4. Procesar la respuesta
      console.log('Procesando la respuesta...');
      const resultado = await this.procesarRespuestaAnulacionSOAP(respuestaSOAP);

      if (resultado.exitoso) {
        const resultadocrearRegistroFactura = await this.crearRegistroFacturaAnulada(resultado, datosFactura);
      }

      return resultado;
    } catch (error) {
      console.error('Error en el proceso de certificación:', error);
      return {
        exitoso: false,
        error: error.message
      };
    }
  }

  /**************************************************************************************************************************************************/
  /**
   * Crea el XML del DTE para FEL Guatemala
   * @param {Object} datosFactura - Datos de la factura a Anular
   * @returns {String} XML generado
   */
  crearXmlFelAnulacion(datosFactura) {
    // Creamos un objeto builder de xml2js con las opciones necesarias
    const builder = new xml2js.Builder({
      xmldec: { version: '1.0', encoding: 'UTF-8' },
      renderOpts: {
        pretty: true,
        indent: '  ',
        newline: '\n'
      },
      headless: false // Para incluir la declaración XML
    });

    // Definimos los namespaces requeridos por SAT
    const namespaces = {
      'Version': '0.1',
      'xmlns:dte': 'http://www.sat.gob.gt/dte/fel/0.1.0',
      'xmlns:ds': 'http://www.w3.org/2000/09/xmldsig#',
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
    };

    // Extraemos datos de la factura o usamos valores por defecto
    const {
      nitEmisor = '107346834',
      nombreEmisor = 'TEKRA SOCIEDAD ANONIMA',
      nitReceptor = '4982398',
      NumeroDocumentoAAnular = '7C4ACF66-53BD-5332-8F0A-43DAFED18619',
      FechaEmisionDocumentoAnular = "2025-07-06 00:41:37",
      MotivoAnulacion = "107346834"
    } = datosFactura || {};

    // Crear fecha de anulación en formato ISO
    const fechaAnulacion = new Date().toISOString();

    // Creamos la estructura del DTE según documentación
    const dteObj = {
      'dte:GTAnulacionDocumento': {
        '$': namespaces,
        'dte:SAT': {
          'dte:AnulacionDTE': {
            '$': {
              'ID': 'DatosCertificados'
            },
            'dte:DatosGenerales': {
              '$': {
                'ID': 'DatosAnulacion',
                'NumeroDocumentoAAnular': NumeroDocumentoAAnular,
                'NITEmisor': nitEmisor,
                'IDReceptor': nitReceptor,
                'FechaEmisionDocumentoAnular': FechaEmisionDocumentoAnular,
                'FechaHoraAnulacion': fechaAnulacion,
                'MotivoAnulacion': MotivoAnulacion
              }
            }
          }
        }
      }
    };

    // Convertimos el objeto a XML
    const xml = builder.buildObject(dteObj);

    return xml;
  }

  /**************************************************************************************************************************************************/
  /**
   * Crea la solicitud SOAP con el XML de DTE
   * @param {String} xmlDTE - XML del DTE
   * @returns {String} Solicitud SOAP completa
   */
  crearSolicitudAnulacionSOAP(xmlDTE) {
    // Datos de autenticación
    const autenticacion = `
      <Autenticacion>
        <pn_usuario>${this.config.usuario}</pn_usuario>
        <pn_clave>${this.config.clave}</pn_clave>
        <pn_cliente>${this.config.cliente}</pn_cliente>
        <pn_contrato>${this.config.contrato}</pn_contrato>
        <pn_id_origen>${this.config.id_origen}</pn_id_origen>
        <pn_ip_origen>${this.config.ip_origen}</pn_ip_origen>
        <pn_firmar_emisor>${this.config.firmar_emisor}</pn_firmar_emisor>
      </Autenticacion>
    `;

    // Encapsulamos el XML del DTE en un CDATA para la solicitud SOAP
    const documento = `
      <Documento>
        <![CDATA[${xmlDTE}]]>
      </Documento>
    `;

    // Construimos la solicitud SOAP completa
    const soapEnvelope = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:urn="http://apicertificacion.desa.tekra.com.gt:8080/certificacion/wsdl/">
        <soapenv:Header/>
        <soapenv:Body>
          <urn:AnulacionDocumento>
            ${autenticacion}
            ${documento}
          </urn:AnulacionDocumento>
        </soapenv:Body>
    </soapenv:Envelope>
    `;

    return soapEnvelope;
  }

  /**************************************************************************************************************************************************/
  /**
   * Envía la solicitud al servicio web SOAP
   * @param {String} soapEnvelope - Solicitud SOAP
   * @returns {Promise<String>} Respuesta del servicio web
   */
  async enviarSolicitudAnulacionSOAP(soapEnvelope) {
    try {
      const response = await axios.post(
        this.config.urlCertificacion,
        soapEnvelope,
        {
          headers: {
            'Content-Type': 'text/xml;charset=UTF-8',
            'SOAPAction': '',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al enviar la solicitud SOAP:', error);
      throw error;
    }
  }

  /**************************************************************************************************************************************************/
  /**
   * Procesa la respuesta SOAP y extrae la información relevante
   * @param {String} respuestaSOAP - Respuesta SOAP completa
   * @returns {Promise<Object>} Información procesada
   */
  async procesarRespuestaAnulacionSOAP(respuestaSOAP) {
    try {
      const parser = new xml2js.Parser({ explicitArray: false });
      const result = await new Promise((resolve, reject) => {
        parser.parseString(respuestaSOAP, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      // Navegamos por la estructura de la respuesta SOAP para obtener los datos relevantes
      const response = result['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:AnulacionDocumentoResponse'];

      // Parseamos el JSON que viene como string en ResultadoCertificacion
      const resultadoCertificacion = JSON.parse(response.ResultadoAnulacion);

      // Construimos el objeto de resultado
      const resultadoFinal = {
        error: resultadoCertificacion.error,
        frases: resultadoCertificacion.frases || [],
        mensajes_marcas: resultadoCertificacion.mensajes_marcas || [],
        errores_xsd: resultadoCertificacion.errores_xsd,
        documentoCertificado: response.DocumentoCertificado,
        representacionGrafica: response.RepresentacionGrafica,
        codigoQR: response.CodigoQR,
        NITCertificador: response.NITCertificador,
        NombreCertificador: response.NombreCertificador,
        NumeroAutorizacion: response.NumeroAutorizacion,
        NumeroDocumento: response.NumeroDocumento,
        SerieDocumento: response.SerieDocumento,
        FechaHoraEmision: response.FechaHoraEmision,
        FechaHoraCertificacion: response.FechaHoraCertificacion,
        // NombreReceptor: response.NombreReceptor,
        EstadoDocumento: response.EstadoDocumento,
        exitoso: resultadoCertificacion.error === 0
      };

      return resultadoFinal;
    } catch (error) {
      console.error('Error al procesar la respuesta SOAP:', error);
      return {
        exitoso: false,
        error: error.message
      };
    }
  }

  /**************************************************************************************************************************************************/
  /**
   * Guarda archivos XML para depuración o auditoría
   * @param {String} nombreArchivo - Nombre base del archivo
   * @param {String} contenido - Contenido a guardar
   * @returns {String} Ruta completa donde se guardó el archivo
   */
  async crearRegistroFacturaAnulada(resultado, datosFactura) {

    const {
      id_venta = datosFactura.idventa,
      uuid = resultado.NumeroAutorizacion,
      serie = resultado.SerieDocumento,
      numero_documento = resultado.NumeroDocumento,
      fecha_certificacion = resultado.FechaHoraCertificacion,
      fecha_emision = resultado.FechaHoraEmision,
      estado = resultado.EstadoDocumento,
      descripcion_anulacion = datosFactura.MotivoAnulacion,
      xml_certificado = resultado.documentoCertificado,
      pdf_base64 = resultado.representacionGrafica
    } = resultado;

    try {
      const [result] = await promisePool.query(
        `UPDATE documentos_fel SET estado = ?, pdf_base64 = ?, fecha_anulacion = ?, descripcion_anulacion = ? WHERE uuid = ? AND id_venta = ?`,
        [estado, pdf_base64, fecha_certificacion, descripcion_anulacion, uuid, id_venta]
      );


      const resultadoFinal = {
        exitoso: result.affectedRows > 0,
        message: "Factura Anulada exitosamente"
      };

      return resultadoFinal;
    } catch (error) {
      console.error('Error no es posible Guardar la Factura!', error);
      return {
        exitoso: false,
        error: error.message
      };
    }
  }

}
module.exports = new facturacionService();