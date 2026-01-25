import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import {
  UploadCloud,
  Trash2,
  ArrowLeft,
  Loader,
  X,
  RefreshCw,
  Pencil,
  Plus,
} from "lucide-react";
import api from "../../api/axios";

function getDefaultVariant(variants) {
  const list = Array.isArray(variants) ? variants.filter(Boolean) : [];
  if (!list.length) return null;
  return list.find((v) => v?.isDefault) || list[0];
}

function getDefaultVariantPrice(product) {
  const v = getDefaultVariant(product?.variants);
  const p = v?.price;
  return Number.isFinite(Number(p)) ? Number(p) : null;
}

function normalizeVariants(raw) {
  const list = (Array.isArray(raw) ? raw : []).map((v) => ({
    label: String(v?.label || "").trim(),
    price: Number(v?.price ?? 0),
    stock: Number(v?.stock ?? 0),
    isDefault: Boolean(v?.isDefault),
  }));
  // ensure exactly one default if possible
  const firstIdx = list.findIndex((v) => v.isDefault);
  for (let i = 0; i < list.length; i++) list[i].isDefault = i === (firstIdx >= 0 ? firstIdx : 0);
  return list;
}

function validateVariants(list) {
  if (!Array.isArray(list) || list.length === 0) return "Please add at least one variant.";
  for (const v of list) {
    if (!String(v?.label || "").trim()) return "Variant label is required (e.g. 250g).";
    const price = Number(v?.price);
    const stock = Number(v?.stock);
    if (!Number.isFinite(price) || price < 0) return "Variant price must be a number ≥ 0.";
    if (!Number.isFinite(stock) || stock < 0) return "Variant stock must be a number ≥ 0.";
  }
  const defaults = list.filter((v) => v?.isDefault).length;
  if (defaults !== 1) return "Please select exactly one default variant.";
  return "";
}

/* ---------------- Custom Modal (Portal + Z-Index Fixed) ---------------- */
const CustomModal = ({ isOpen, type, message, action, onClose }) => {
  if (!isOpen) return null;
  const isConfirm = type === "confirm";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-lg bg-[#FAF7F2] border border-[rgba(142,27,27,0.25)] p-6 shadow-2xl">
        <div className="flex justify-between mb-4">
          <h4 className="text-lg font-semibold text-[#1F1B16]">
            {isConfirm ? "Confirm Action" : "Notification"}
          </h4>
          <button onClick={onClose} className="text-gray-400 hover:text-black">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-[#6F675E] mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          {isConfirm ? (
            <>
              <button onClick={onClose} className="rounded-md border px-4 py-2 text-sm">Cancel</button>
              <button onClick={action} className="rounded-md bg-[#8E1B1B] px-4 py-2 text-sm text-white font-medium">Confirm</button>
            </>
          ) : (
            <button onClick={onClose} className="rounded-md bg-[#8E1B1B] px-4 py-2 text-sm text-white">Close</button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

/* ---------------- Edit Product Modal ---------------- */
const EditProductModal = ({
  open,
  product,
  saving,
  register,
  handleSubmit,
  onSubmit,
  onClose,
  editPreviews,
  onEditFiles,
  onRemoveEditImage,
  hasVariants,
  setHasVariants,
  variants,
  setVariants,
}) => {
  if (!open || !product) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-xl bg-[#FAF7F2] border border-[rgba(142,27,27,0.25)] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(142,27,27,0.15)]">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-[#1F1B16]">Edit product</h3>
            <p className="text-xs text-[#6F675E] mt-0.5 line-clamp-1">{product?.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              {...register("name", { required: true })}
              placeholder="Product name"
              className="rounded-md p-3 border border-gray-300 outline-none focus:border-[#8E1B1B]"
            />
            <input
              {...register("price", { required: true })}
              type="number"
              placeholder="Price (Rs.)"
              className="rounded-md p-3 border border-gray-300 outline-none focus:border-[#8E1B1B]"
            />
            <input
              {...register("netQuantity")}
              placeholder="Net Quantity (e.g. 500 g)"
              className="rounded-md p-3 border border-gray-300 outline-none focus:border-[#8E1B1B]"
            />
            <input
              {...register("shelfLife")}
              placeholder="Shelf Life (e.g. 6 months)"
              className="rounded-md p-3 border border-gray-300 outline-none focus:border-[#8E1B1B]"
            />
            <input
              {...register("ingredients")}
              placeholder="Ingredients"
              className="rounded-md p-3 border border-gray-300 outline-none focus:border-[#8E1B1B]"
            />
            <input
              {...register("storage")}
              placeholder="Storage (e.g. Cool & dry place)"
              className="rounded-md p-3 border border-gray-300 outline-none focus:border-[#8E1B1B]"
            />
            <select
              {...register("stockStatus", { required: true })}
              className="rounded-md p-3 border border-gray-300"
            >
              <option value="instock">In Stock</option>
              <option value="outofstock">Out of Stock</option>
            </select>
            <div className="relative flex items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-3 hover:bg-white transition-colors">
              <div className="flex items-center gap-2 text-gray-500">
                <UploadCloud className="h-5 w-5 text-[#8E1B1B]" />
                <span className="text-sm font-medium">Upload new photos (optional)</span>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => onEditFiles?.(e.target.files)}
              />
            </div>
          </div>

          {/* Variants */}
          <div className="rounded-xl border border-[rgba(142,27,27,0.15)] bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[#1F1B16]">Has variants</p>
                <p className="text-xs text-[#6F675E] mt-0.5">Use sizes like 250g / 500g with separate price and stock.</p>
              </div>
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#1F1B16]">
                <input
                  type="checkbox"
                  checked={!!hasVariants}
                  onChange={(e) => {
                    const next = e.target.checked;
                    setHasVariants?.(next);
                    if (next && (!variants || variants.length === 0)) {
                      setVariants?.([{ label: "250g", price: 0, stock: 0, isDefault: true }]);
                    }
                    if (!next) {
                      setVariants?.([]);
                    }
                  }}
                  className="accent-[#8E1B1B]"
                />
                Enable
              </label>
            </div>

            {hasVariants ? (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <div className="col-span-4">Label</div>
                  <div className="col-span-3">Price</div>
                  <div className="col-span-3">Stock</div>
                  <div className="col-span-2 text-right">Default</div>
                </div>

                {(variants || []).map((v, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      value={v.label}
                      onChange={(e) =>
                        setVariants?.((prev) =>
                          prev.map((x, i) => (i === idx ? { ...x, label: e.target.value } : x))
                        )
                      }
                      placeholder="250g"
                      className="col-span-4 rounded-md p-2 border border-gray-300 outline-none focus:border-[#8E1B1B]"
                    />
                    <input
                      value={v.price}
                      type="number"
                      min="0"
                      onChange={(e) =>
                        setVariants?.((prev) =>
                          prev.map((x, i) => (i === idx ? { ...x, price: e.target.value } : x))
                        )
                      }
                      placeholder="199"
                      className="col-span-3 rounded-md p-2 border border-gray-300 outline-none focus:border-[#8E1B1B]"
                    />
                    <input
                      value={v.stock}
                      type="number"
                      min="0"
                      onChange={(e) =>
                        setVariants?.((prev) =>
                          prev.map((x, i) => (i === idx ? { ...x, stock: e.target.value } : x))
                        )
                      }
                      placeholder="20"
                      className="col-span-3 rounded-md p-2 border border-gray-300 outline-none focus:border-[#8E1B1B]"
                    />
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <input
                        type="radio"
                        checked={!!v.isDefault}
                        onChange={() =>
                          setVariants?.((prev) => prev.map((x, i) => ({ ...x, isDefault: i === idx })))
                        }
                        className="accent-[#8E1B1B]"
                        aria-label="Default variant"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setVariants?.((prev) => {
                            const next = prev.filter((_, i) => i !== idx);
                            if (next.length && !next.some((x) => x.isDefault)) next[0].isDefault = true;
                            return next;
                          })
                        }
                        className="text-red-500 hover:text-red-700 text-xs font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setVariants?.((prev) => [...(prev || []), { label: "", price: 0, stock: 0, isDefault: false }])
                  }
                  className="inline-flex items-center gap-2 rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-[#1F1B16] hover:bg-gray-50"
                >
                  <Plus size={16} /> Add variant
                </button>
              </div>
            ) : null}
          </div>

          {editPreviews?.length ? (
            <div className="flex gap-3 flex-wrap">
              {editPreviews.map((src, i) => (
                <div key={i} className="relative group">
                  <img src={src} className="h-24 w-24 rounded shadow-md object-cover border-2 border-white" />
                  <button
                    type="button"
                    onClick={() => onRemoveEditImage?.(i)}
                    className="absolute -top-2 -right-2 rounded-full bg-red-600 p-1 text-white shadow-lg"
                    aria-label="Remove image"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <textarea
            {...register("description", { required: true })}
            rows="4"
            placeholder="Product description"
            className="w-full rounded-md p-3 border border-gray-300 outline-none focus:border-[#8E1B1B]"
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-4 py-2 text-sm bg-white hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              disabled={saving}
              className="bg-[#8E1B1B] text-white px-6 py-2.5 rounded-md font-bold hover:bg-[#6D1414] transition-all flex items-center gap-2 disabled:bg-gray-400"
            >
              {saving ? <Loader className="h-4 w-4 animate-spin" /> : null}
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

/* ---------------- MAIN ---------------- */
const ProductManager = () => {
  const { register, handleSubmit, reset } = useForm();
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
  } = useForm();
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null); // Track which product is updating status

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [editImages, setEditImages] = useState([]);
  const [editPreviews, setEditPreviews] = useState([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const [hasVariantsEdit, setHasVariantsEdit] = useState(false);
  const [variantsEdit, setVariantsEdit] = useState([]);

  const [hasVariantsAdd, setHasVariantsAdd] = useState(false);
  const [variantsAdd, setVariantsAdd] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      if (res.data.success) setProducts(res.data.products);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  /* ---------------- UPDATE STATUS LOGIC ---------------- */
const handleStatusChange = async (id, newStatus) => {
  try {
    setUpdatingId(id);
    console.log(`Updating ${id} to ${newStatus}`);

    // backend expects PUT + multipart/form-data
    const formData = new FormData();
    formData.append("quantity", newStatus);

    const res = await api.put(`/products/${id}`, formData);

    if (res.data.success) {
      setProducts(prev =>
        prev.map(p =>
          p._id === id ? { ...p, quantity: newStatus } : p
        )
      );
    }
  } catch (err) {
    console.error("Update Error:", err.response?.data || err.message);
    openInfoModal(
      err.response?.data?.message || "Server unreachable"
    );
  } finally {
    setUpdatingId(null);
  }
};

  /* ---------------- EDIT PRODUCT LOGIC ---------------- */
  const openEdit = (p) => {
    setEditProduct(p);
    setEditImages([]);
    setEditPreviews([]);
    const hasV = Array.isArray(p?.variants) && p.variants.length > 0;
    setHasVariantsEdit(hasV);
    setVariantsEdit(
      hasV
        ? normalizeVariants(p.variants)
        : []
    );
    resetEdit({
      name: p?.name || "",
      price: p?.price ?? "",
      stockStatus: p?.quantity || "instock",
      description: p?.description || p?.desc || "",
      netQuantity: p?.netQuantity || "",
      shelfLife: p?.shelfLife || "",
      ingredients: p?.ingredients || "",
      storage: p?.storage || "",
    });
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditProduct(null);
    setEditImages([]);
    setEditPreviews([]);
    setHasVariantsEdit(false);
    setVariantsEdit([]);
  };

  const handleEditFileChange = (files) => {
    const selected = Array.from(files || []).slice(0, 4);
    selected.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setEditPreviews((p) => [...p, reader.result]);
      reader.readAsDataURL(file);
    });
    setEditImages(selected);
  };

  const removeEditImage = (i) => {
    setEditImages((prev) => prev.filter((_, idx) => idx !== i));
    setEditPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const onEditSubmit = async (data) => {
    if (!editProduct?._id) return;
    try {
      setSavingEdit(true);
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("desc", data.description);
      // If variants are enabled, set base price to default variant price for backward compatibility
      if (hasVariantsEdit) {
        const normalized = normalizeVariants(variantsEdit);
        const err = validateVariants(normalized);
        if (err) {
          openInfoModal(err);
          return;
        }
        const def = getDefaultVariant(normalized);
        formData.append("price", String(def?.price ?? 0));
        formData.append("variants", JSON.stringify(normalized));
      } else {
        formData.append("price", data.price);
        formData.append("variants", JSON.stringify([]));
      }
      formData.append("quantity", data.stockStatus);
      formData.append("netQuantity", data.netQuantity || "");
      formData.append("shelfLife", data.shelfLife || "");
      formData.append("ingredients", data.ingredients || "");
      formData.append("storage", data.storage || "");
      if (Array.isArray(editImages) && editImages.length) {
        editImages.forEach((img) => formData.append("photos", img));
      }

      const res = await api.put(`/products/${editProduct._id}`, formData);
      if (res?.data?.success) {
        openInfoModal(`Product "${data.name}" updated successfully!`);
        closeEdit();
        fetchProducts();
      } else {
        openInfoModal(res?.data?.message || "Update failed");
      }
    } catch (err) {
      openInfoModal(err?.response?.data?.message || "Update failed");
    } finally {
      setSavingEdit(false);
    }
  };


  const onSubmit = async (data) => {
    if (images.length === 0) {
      openInfoModal("Please upload at least one image.");
      return;
    }
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("desc", data.description);
      if (hasVariantsAdd) {
        const normalized = normalizeVariants(variantsAdd);
        const err = validateVariants(normalized);
        if (err) {
          openInfoModal(err);
          return;
        }
        const def = getDefaultVariant(normalized);
        formData.append("price", String(def?.price ?? 0));
        formData.append("variants", JSON.stringify(normalized));
      } else {
        formData.append("price", data.price);
        formData.append("variants", JSON.stringify([]));
      }
      formData.append("quantity", data.stockStatus);
      formData.append("netQuantity", data.netQuantity || "");
      formData.append("shelfLife", data.shelfLife || "");
      formData.append("ingredients", data.ingredients || "");
      formData.append("storage", data.storage || "");

      images.forEach((img) => formData.append("photos", img));
    

      const res = await api.post("/products", formData);
      if (res.data.success) {
        openInfoModal(`Product "${data.name}" added successfully!`);
        reset();
        setImages([]);
        setPreviews([]);
        setHasVariantsAdd(false);
        setVariantsAdd([]);
        fetchProducts();
      }
    } catch (err) {
      openInfoModal(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const performDeleteProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      openInfoModal("Could not delete product.");
    }
  };

  const openInfoModal = (message) => {
    setModalConfig({ type: "info", message });
    setIsModalOpen(true);
  };

  const openConfirmModal = (message, action) => {
    setModalConfig({ type: "confirm", message, action });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalConfig(null);
  };

  const handleFileChange = (files) => {
    const selected = Array.from(files).slice(0, 4 - images.length);
    selected.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviews((p) => [...p, reader.result]);
      reader.readAsDataURL(file);
    });
    setImages((prev) => [...prev, ...selected]);
  };

  const removeImage = (i) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] px-6 py-14 pt-24">
      <CustomModal
        isOpen={isModalOpen}
        type={modalConfig?.type}
        message={modalConfig?.message}
        action={modalConfig?.action}
        onClose={closeModal}
      />
      <EditProductModal
        open={editOpen}
        product={editProduct}
        saving={savingEdit}
        register={registerEdit}
        handleSubmit={handleSubmitEdit}
        onSubmit={onEditSubmit}
        onClose={closeEdit}
        editPreviews={editPreviews}
        onEditFiles={handleEditFileChange}
        onRemoveEditImage={removeEditImage}
        hasVariants={hasVariantsEdit}
        setHasVariants={setHasVariantsEdit}
        variants={variantsEdit}
        setVariants={setVariantsEdit}
      />

      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => window.history.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#6F675E] hover:text-[#8E1B1B] transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {/* ADD PRODUCT FORM */}
        <div className="mb-10 rounded-xl border border-[rgba(142,27,27,0.15)] bg-[#F3EFE8] p-6 shadow-sm">
          <h2 className="mb-6 text-2xl font-bold text-[#1F1B16]">Add New Product</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input
  {...register("netQuantity")}
  placeholder="Net Quantity (e.g. 500 g)"
  className="rounded-md p-3 border border-gray-300 outline-none focus:border-[#8E1B1B]"
/>

<input
  {...register("shelfLife")}
  placeholder="Shelf Life (e.g. 6 months)"
  className="rounded-md p-3 border border-gray-300 outline-none focus:border-[#8E1B1B]"
/>

<input
  {...register("ingredients")}
  placeholder="Ingredients (short)"
  className="rounded-md p-3 border border-gray-300 outline-none focus:border-[#8E1B1B]"
/>

<input
  {...register("storage")}
  placeholder="Storage (e.g. Cool & dry place)"
  className="rounded-md p-3 border border-gray-300 outline-none focus:border-[#8E1B1B]"
/>

              <input {...register("name", { required: true })} placeholder="Product name" className="rounded-md p-3 border border-gray-300 outline-none focus:border-[#8E1B1B]" />
              <input {...register("price", { required: true })} type="number" placeholder="Price (Rs.)" className="rounded-md p-3 border border-gray-300 outline-none focus:border-[#8E1B1B]" />
              <select {...register("stockStatus", { required: true })} className="rounded-md p-3 border border-gray-300">
                <option value="instock">In Stock</option>
                <option value="outofstock">Out of Stock</option>
              </select>
              <div className="relative flex items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-3 hover:bg-white transition-colors">
                <div className="flex items-center gap-2 text-gray-500">
                   <UploadCloud className="h-5 w-5 text-[#8E1B1B]" />
                   <span className="text-sm font-medium">Upload Photos</span>
                </div>
                <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e.target.files)} />
              </div>
            </div>

            {/* Variants */}
            <div className="rounded-xl border border-[rgba(142,27,27,0.15)] bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-[#1F1B16]">Has variants</p>
                  <p className="text-xs text-[#6F675E] mt-0.5">Use sizes like 250g / 500g with separate price and stock.</p>
                </div>
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#1F1B16]">
                  <input
                    type="checkbox"
                    checked={!!hasVariantsAdd}
                    onChange={(e) => {
                      const next = e.target.checked;
                      setHasVariantsAdd(next);
                      if (next && (!variantsAdd || variantsAdd.length === 0)) {
                        setVariantsAdd([{ label: "250g", price: 0, stock: 0, isDefault: true }]);
                      }
                      if (!next) setVariantsAdd([]);
                    }}
                    className="accent-[#8E1B1B]"
                  />
                  Enable
                </label>
              </div>

              {hasVariantsAdd ? (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-4">Label</div>
                    <div className="col-span-3">Price</div>
                    <div className="col-span-3">Stock</div>
                    <div className="col-span-2 text-right">Default</div>
                  </div>

                  {(variantsAdd || []).map((v, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        value={v.label}
                        onChange={(e) =>
                          setVariantsAdd((prev) =>
                            prev.map((x, i) => (i === idx ? { ...x, label: e.target.value } : x))
                          )
                        }
                        placeholder="250g"
                        className="col-span-4 rounded-md p-2 border border-gray-300 outline-none focus:border-[#8E1B1B]"
                      />
                      <input
                        value={v.price}
                        type="number"
                        min="0"
                        onChange={(e) =>
                          setVariantsAdd((prev) =>
                            prev.map((x, i) => (i === idx ? { ...x, price: e.target.value } : x))
                          )
                        }
                        placeholder="199"
                        className="col-span-3 rounded-md p-2 border border-gray-300 outline-none focus:border-[#8E1B1B]"
                      />
                      <input
                        value={v.stock}
                        type="number"
                        min="0"
                        onChange={(e) =>
                          setVariantsAdd((prev) =>
                            prev.map((x, i) => (i === idx ? { ...x, stock: e.target.value } : x))
                          )
                        }
                        placeholder="20"
                        className="col-span-3 rounded-md p-2 border border-gray-300 outline-none focus:border-[#8E1B1B]"
                      />
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        <input
                          type="radio"
                          checked={!!v.isDefault}
                          onChange={() =>
                            setVariantsAdd((prev) => prev.map((x, i) => ({ ...x, isDefault: i === idx })))
                          }
                          className="accent-[#8E1B1B]"
                          aria-label="Default variant"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setVariantsAdd((prev) => {
                              const next = prev.filter((_, i) => i !== idx);
                              if (next.length && !next.some((x) => x.isDefault)) next[0].isDefault = true;
                              return next;
                            })
                          }
                          className="text-red-500 hover:text-red-700 text-xs font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setVariantsAdd((prev) => [...(prev || []), { label: "", price: 0, stock: 0, isDefault: false }])}
                    className="inline-flex items-center gap-2 rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-[#1F1B16] hover:bg-gray-50"
                  >
                    <Plus size={16} /> Add variant
                  </button>
                </div>
              ) : null}
            </div>

            {/* Image Previews */}
            <div className="flex gap-3 flex-wrap">
              {previews.map((src, i) => (
                <div key={i} className="relative group">
                  <img src={src} className="h-24 w-24 rounded shadow-md object-cover border-2 border-white" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 rounded-full bg-red-600 p-1 text-white shadow-lg">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            <textarea {...register("description", { required: true })} rows="3" placeholder="Product Description..." className="w-full rounded-md p-3 border border-gray-300 outline-none focus:border-[#8E1B1B]" />

            <button disabled={uploading} className="bg-[#8E1B1B] text-white px-8 py-3 rounded-md font-bold hover:bg-[#6D1414] transition-all flex items-center gap-2 disabled:bg-gray-400">
              {uploading ? <Loader className="h-4 w-4 animate-spin" /> : null}
              Publish Product
            </button>
          </form>
        </div>

        {/* PRODUCT LIST TABLE */}
        <div className="rounded-xl border border-[rgba(142,27,27,0.15)] bg-[#F3EFE8] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-[#1F1B16]">Inventory Overview</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#FAF7F2]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img src={p.photo || p.photos?.[0]} className="h-12 w-12 rounded object-cover border" />
                        <span className="font-semibold text-[#1F1B16]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#6F675E] font-medium">
                      {Array.isArray(p?.variants) && p.variants.length
                        ? `Rs. ${getDefaultVariantPrice(p) ?? p.price}`
                        : `Rs. ${p.price}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {updatingId === p._id ? (
                          <RefreshCw size={14} className="animate-spin text-[#8E1B1B]" />
                        ) : null}
                        <select
                          value={p.quantity}
                          onChange={(e) => handleStatusChange(p._id, e.target.value)}
                          className={`text-xs font-bold rounded-full px-3 py-1 border-0 cursor-pointer outline-none transition-colors 
                            ${p.quantity === 'instock' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                        >
                          <option value="instock">IN STOCK</option>
                          <option value="outofstock">OUT OF STOCK</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => openEdit(p)}
                        className="text-[#6F675E] hover:text-[#8E1B1B] p-2 transition-colors"
                        aria-label={`Edit ${p.name}`}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => openConfirmModal(`Are you sure you want to delete "${p.name}"?`, () => { performDeleteProduct(p._id); closeModal(); })}
                        className="text-red-400 hover:text-red-600 p-2 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductManager;
