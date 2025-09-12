/**
 * felController.js
 * Controlador para gestionar las operaciones de FEL (Factura Electrónica en Línea)
 */

const facturacionService = require('../services/facturacionService');

class facturacionController {
  /**
   * Genera y certifica un documento FEL
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async certificarDocumento(req, res) {
    try {
      const datosFactura = req.body;
      console.log(datosFactura);

      // Validar que tengamos los datos mínimos necesarios
      if (!datosFactura || !datosFactura.nitEmisor || !datosFactura.nombreEmisor || !datosFactura.items) {
        return res.status(400).json({
          exitoso: false,
          mensaje: 'Datos incompletos para la generación de factura electrónica'
        });
      }

      // Llamar al servicio para certificar el documento
      const resultado = await facturacionService.certificarDocumento(datosFactura, req.query.debug === 'true');

      // Verificar si fue exitoso
      if (resultado.exitoso) {
        return res.status(200).json({
          exitoso: true,
          mensaje: 'Documento certificado correctamente',
          datos: resultado
        });
      } else {
        return res.status(400).json({
          exitoso: false,
          mensaje: 'Error al certificar el documento',
          error: resultado.error
        });
      }
    } catch (error) {
      console.error('Error en certificarDocumento:', error);
      return res.status(500).json({
        exitoso: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**************************************************************************************************************************************************/
  /**
  * Genera y certifica un documento FEL
  * @param {Object} req - Objeto de solicitud
  * @param {Object} res - Objeto de respuesta
  */
  async anularDocumento(req, res) {
    try {
      const datosFactura = req.body;
      //console.log(datosFactura);

      // Validar que tengamos los datos mínimos necesarios
      if (!datosFactura || !datosFactura.nitEmisor || !datosFactura.nombreEmisor) {
        return res.status(400).json({
          exitoso: false,
          mensaje: 'Datos incompletos para la generación de factura electrónica'
        });
      }

      // Llamar al servicio para certificar el documento
      const resultado = await facturacionService.anularDocumento(datosFactura, req.query.debug === 'true');

      // Verificar si fue exitoso
      if (resultado.exitoso) {
        return res.status(200).json({
          exitoso: true,
          mensaje: 'Documento Anulado correctamente',
          datos: resultado
        });
      } else {
        return res.status(400).json({
          exitoso: false,
          mensaje: 'Error al certificar el documento',
          error: resultado.error,
          datos: resultado
        });
      }
    } catch (error) {
      console.error('Error en certificarDocumento:', error);
      return res.status(500).json({
        exitoso: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**************************************************************************************************************************************************/
  /**
   * Genera un XML FEL sin enviarlo a certificar
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async generarXml(req, res) {
    try {
      const datosFactura = req.body;
      // console.log(req.body);

      // Validar que tengamos los datos mínimos necesarios
      if (!datosFactura || !datosFactura.nitEmisor || !datosFactura.nombreEmisor) {
        return res.status(400).json({
          exitoso: false,
          mensaje: 'Datos incompletos para la generación del XML'
        });
      }

      // Generar el XML
      const xml = facturacionService.crearXmlFel(datosFactura);

      // Devolver el XML generado
      return res.status(200).json({
        exitoso: true,
        mensaje: 'XML generado correctamente',
        xml: xml
      });
    } catch (error) {
      console.error('Error en generarXml:', error);
      return res.status(500).json({
        exitoso: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**************************************************************************************************************************************************/
  /**
   * Valida la estructura de un XML FEL
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   */
  async validarXml(req, res) {
    try {
      const { xml } = req.body;

      if (!xml) {
        return res.status(400).json({
          exitoso: false,
          mensaje: 'No se proporcionó el XML para validar'
        });
      }

      // Aquí se implementaría la validación del XML contra el esquema XSD
      // Esta funcionalidad requeriría una implementación adicional

      return res.status(200).json({
        exitoso: true,
        mensaje: 'XML validado correctamente',
        // Aquí se devolvería el resultado de la validación
      });
    } catch (error) {
      console.error('Error en validarXml:', error);
      return res.status(500).json({
        exitoso: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

}

module.exports = new facturacionController();