const MASTER_CONFIG = {
  payment_terms: {
    modelName: 'PaymentTerm',
    displayName: 'Payment Terms',
    singularName: 'Payment Term',
    nameField: 'name',
    searchFields: ['name', 'description'],
    tableColumns: [
      { header: 'Payment Term', accessor: 'name' },
      { header: 'Description', accessor: 'description' },
      { header: 'Status', accessor: 'status' },
    ],
    defaultSort: { name: 1 },
    dependencyModels: [
      { model: 'Shipment', path: 'shippingDetails.paymentTerm' },
      { model: 'Quotation', path: 'paymentTerm' },
      { model: 'Customer', path: 'paymentTerms' },
    ],
  },
  product_categories: {
    modelName: 'ProductCategory',
    displayName: 'Product Categories',
    singularName: 'Product Category',
    nameField: 'categoryName',
    searchFields: ['categoryName', 'description'],
    tableColumns: [
      { header: 'Category Name', accessor: 'categoryName' },
      { header: 'Description', accessor: 'description' },
      { header: 'Status', accessor: 'status' },
    ],
    defaultSort: { categoryName: 1 },
    dependencyModels: [
      { model: 'Product', path: 'category' },
    ],
  },
  export_terms: {
    modelName: 'ExportTerm',
    displayName: 'Export Terms',
    singularName: 'Export Term',
    nameField: 'term',
    searchFields: ['term', 'description'],
    tableColumns: [
      { header: 'Export Term (Incoterm)', accessor: 'term' },
      { header: 'Description', accessor: 'description' },
      { header: 'Status', accessor: 'status' },
    ],
    defaultSort: { term: 1 },
    dependencyModels: [
      { model: 'Shipment', path: 'shippingDetails.exportTerm' },
    ],
  },
  hsn_codes: {
    modelName: 'HsnCode',
    displayName: 'HSN Codes',
    singularName: 'HSN Code',
    nameField: 'hsnCode',
    searchFields: ['hsnCode', 'description'],
    tableColumns: [
      { header: 'HSN Code', accessor: 'hsnCode' },
      { header: 'GST %', accessor: 'gstPercentage' },
      { header: 'Description', accessor: 'description' },
      { header: 'Status', accessor: 'status' },
    ],
    defaultSort: { hsnCode: 1 },
    dependencyModels: [
      { model: 'Product', path: 'hsn' },
    ],
  },
  container_quantities: {
    modelName: 'ContainerQuantity',
    displayName: 'Container Quantities',
    singularName: 'Container Quantity',
    nameField: 'quantityName',
    searchFields: ['quantityName', 'description'],
    tableColumns: [
      { header: 'Container Type / Quantity', accessor: 'quantityName' },
      { header: 'Description', accessor: 'description' },
      { header: 'Status', accessor: 'status' },
    ],
    defaultSort: { quantityName: 1 },
    dependencyModels: [
      { model: 'Shipment', path: 'shippingDetails.containerQuantity' },
    ],
  },
};

module.exports = MASTER_CONFIG;
