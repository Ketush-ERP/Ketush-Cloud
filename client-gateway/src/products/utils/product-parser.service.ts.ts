import * as XLSX from 'xlsx';
import { CreateProductsFileDto } from '../dto/create-product.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductParserService {
  private _processPrice(priceStr: string, includesVAT: boolean): number {
    const price = parseFloat(priceStr);
    const VAT_PERCENTAGE = 21;

    if (isNaN(price)) return 0;

    return includesVAT
      ? +price.toFixed(2)
      : +(price * (1 + VAT_PERCENTAGE / 100)).toFixed(2);
  }

  async parse(
    nameFile: string,
    buffer: Buffer,
    includesVAT: boolean,
  ): Promise<CreateProductsFileDto[]> {
    switch (nameFile) {
      case 'JARSE':
        return this.parseJarse(buffer, includesVAT);
      case 'CASALI':
        return this.parseCasali(buffer, includesVAT);
      case 'JACOFER':
        return this.parseJacofer(buffer, includesVAT);
      default:
      case 'LEKONS':
        return this.parseLekons(buffer, includesVAT);
      case 'QUILBER':
        return this.parseQuilber(buffer, includesVAT);
      case 'SANITARIOSRANCAGUA':
        return this.parseSanitariosRancagua(buffer, includesVAT);
      case 'MALANO':
        return this.parseMalano(buffer, includesVAT);
        throw new Error(`Proveedor desconocido`);
    }
  }

  public async parseCasali(
    buffer: Buffer,
    includesVAT: boolean,
  ): Promise<CreateProductsFileDto[]> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    const products: CreateProductsFileDto[] = [];

    for (const row of rows) {
      const listaKey = Object.keys(rows[0]).find((key) =>
        key.toString().toLowerCase().includes('lista'),
      );

      const description = row['CASALI S.R.L.']?.toString().trim();
      const code = row['__EMPTY_1']?.toString().trim();
      let price = row[`${listaKey}`]?.toString().trim();

      if (description && code && price) {
        // Formatear el precio (por si viene como "2.851,17")
        const finalPrice = this._processPrice(price, includesVAT);

        products.push({
          description,
          code,
          price: finalPrice.toString(),
        });
      }
    }
    return products;
  }

  private async parseJarse(
    buffer: Buffer,
    includesVAT: boolean,
  ): Promise<CreateProductsFileDto[]> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const range = XLSX.utils.decode_range(worksheet['!ref']!);

    const products: CreateProductsFileDto[] = [];

    for (let rowIndex = 4; rowIndex <= range.e.r; rowIndex++) {
      const code = this.getCell(worksheet, rowIndex, 0);
      const description = this.getCell(worksheet, rowIndex, 4);

      let cleanDescription = description;

      if (description) {
        // Expresión regular para detectar "*Ahora Incluido* -XX%" al inicio
        const regex = /^\*Ahora Incluido\* -\d+%\s*/;

        if (regex.test(description)) {
          cleanDescription = description.replace(regex, '');
        }
      }

      let price = this.getCell(worksheet, rowIndex, 5);

      // Si alguno de los tres campos está vacío, saltar
      if (!code || !description || !price) continue;

      // Normalizar precio (por si viene con símbolos o formato extraño)
      const finalPrice = this._processPrice(price, includesVAT);

      products.push({
        code: code.trim(),
        description: cleanDescription.trim(), // ✅ Usar la versión limpia
        price: finalPrice.toString(),
      });
    }

    return products;
  }

  private async parseJacofer(
    buffer: Buffer,
    includesVAT: boolean,
  ): Promise<CreateProductsFileDto[]> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rawData: any[][] = XLSX.utils.sheet_to_json(sheet);
    const products: CreateProductsFileDto[] = [];

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      const code = String(row['JACOFER SAFICMYS'] ?? '').trim();
      const description = String(
        row['__EMPTY_1'] ?? row['__EMPTY_'] ?? '',
      ).trim();
      const price = String(row['__EMPTY_3'] ?? row['__EMPTY_2'] ?? '').trim();
      const finalPrice = this._processPrice(price, includesVAT);
      if (code && description && price) {
        products.push({
          code,
          description,
          price: finalPrice.toString(),
        });
      }
    }
    return products;
  }
  private async parseLekons(
    buffer: Buffer,
    includesVAT: boolean,
  ): Promise<CreateProductsFileDto[]> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const products: CreateProductsFileDto[] = [];

    let startIndex = -1;

    // Buscar el encabezado de la tabla (Código | Descripción | Precio)
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      if (
        row[0]?.toString().trim().toLowerCase() === 'código' &&
        row[1]?.toString().trim().toLowerCase() === 'descripción'
      ) {
        startIndex = i + 1; // datos comienzan en la fila siguiente al encabezado
        break;
      }
    }

    if (startIndex === -1) {
      throw new Error('No se encontró el encabezado de la tabla de productos.');
    }

    for (let i = startIndex; i < rawData.length; i++) {
      const row = rawData[i];

      const code = String(row[0] ?? '').trim();
      const description = String(row[1] ?? '').trim();
      const price = String(row[2] ?? '').trim();
      const finalPrice = this._processPrice(price, includesVAT);

      if (code && description && price) {
        products.push({
          code,
          description,
          price: finalPrice.toString(),
        });
      }
    }

    return products;
  }

  private async parseQuilber(
    buffer: Buffer,
    includesVAT: boolean,
  ): Promise<CreateProductsFileDto[]> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const products: CreateProductsFileDto[] = [];

    for (const row of rawData) {
      const code = String(row[0] ?? '').trim();
      const price = String(row[1] ?? '').trim();
      const description = String(row[2] ?? '').trim();
      const finalPrice = this._processPrice(price, includesVAT);
      // Validación: todas las columnas deben tener valor válido
      if (code && description && price) {
        products.push({
          code,
          description,
          price: finalPrice.toString(),
        });
      }
    }

    return products;
  }

  private async parseSanitariosRancagua(
    buffer: Buffer,
    includesVAT: boolean,
  ): Promise<CreateProductsFileDto[]> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const products: CreateProductsFileDto[] = [];

    let startIndex = -1;

    // Buscar el encabezado que contiene 'Código', 'Detalle' y 'PRECIO'
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      if (
        row[0]?.toString().trim().toLowerCase() === 'codigo' &&
        row[1]?.toString().trim().toLowerCase().includes('detalle')
      ) {
        startIndex = i + 1;
        break;
      }
    }

    if (startIndex === -1) {
      throw new Error(
        'No se encontró el encabezado de la tabla de Sanitarios Rancagua.',
      );
    }

    for (let i = startIndex; i < rawData.length; i++) {
      const row = rawData[i];

      const code = String(row[0] ?? '').trim();
      const description = String(row[1] ?? '').trim();
      const price = String(row[2] ?? '').trim();
      const finalPrice = this._processPrice(price, includesVAT);
      if (code && description && price) {
        products.push({
          code,
          description,
          price: finalPrice.toString(),
        });
      }
    }

    return products;
  }

  private async parseMalano(
    buffer: Buffer,
    includesVAT: boolean,
  ): Promise<CreateProductsFileDto[]> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const products: CreateProductsFileDto[] = [];

    for (const row of rawData) {
      // Saltar filas hasta que encontremos la cabecera
      if (
        row[0] === 'CODIGO' &&
        row[1] === 'DESCRIPCION' &&
        row[2] === 'PRECIO'
      ) {
        continue; // saltar la cabecera
      }

      const code = String(row[0] ?? '').trim();
      const description = String(row[1] ?? '').trim();
      const price = String(row[2] ?? '').trim();

      const finalPrice = this._processPrice(price, includesVAT);

      // Validación: todas las columnas deben tener valor válido
      if (code && description && price) {
        products.push({
          code,
          description,
          price: finalPrice.toString(),
        });
      }
    }

    return products;
  }

  private getCell(worksheet: XLSX.WorkSheet, row: number, col: number): string {
    const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: col })];
    return String(cell?.v ?? '').trim();
  }
}
