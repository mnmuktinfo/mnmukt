import React, { useEffect, useMemo, useState } from "react";
import {
  getSiteConfig,
  getSectionInstanceRaw,
  saveSectionInstance,
  saveSectionsBatch,
  deleteSectionInstance,
} from "../../../../user/src/config/data/siteConfigService";
import {
  SECTION_TYPES,
  SINGLETON_TYPES,
  REPEATABLE_TYPES,
  FIELD,
  buildRepeatableInstance,
} from "../../../../user/src/config/data/homepageSchema";
import { useAdminAuth } from "../../context/AdminAuthContext";

/* ---------- primitives ---------- */
const IconButton = ({ onClick, danger, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-2 rounded-lg transition-colors flex items-center justify-center min-w-[36px] min-h-[36px] ${
      danger
        ? "text-red-500 hover:bg-red-50"
        : "text-gray-500 hover:bg-gray-200 hover:text-gray-800"
    }`}>
    {children}
  </button>
);

const Input = (props) => (
  <input
    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2874f0] focus:border-transparent outline-none transition-all"
    {...props}
  />
);

const ImagePreview = ({ src }) =>
  src ? (
    <img
      src={src}
      alt=""
      className="w-16 h-16 sm:w-14 sm:h-14 object-cover rounded-lg border border-gray-200 shadow-sm shrink-0"
      onError={(e) => (e.currentTarget.style.opacity = 0.2)}
    />
  ) : (
    <div className="w-16 h-16 sm:w-14 sm:h-14 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-400 text-xs shrink-0">
      Empty
    </div>
  );

const ToggleField = ({ value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${value ? "bg-[#2874f0]" : "bg-gray-300"}`}>
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? "translate-x-5" : ""}`}
    />
  </button>
);

const SingleImageField = ({ value, onChange }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
    <ImagePreview src={value} />
    <Input
      value={value ?? ""}
      placeholder="https://..."
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const ImageListField = ({ items = [], onChange }) => {
  const update = (i, v) => onChange(items.map((x, idx) => (idx === i ? v : x)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, ""]);
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-3">
      {items.map((url, i) => (
        <div
          key={i}
          className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center gap-3 w-full">
            <ImagePreview src={url} />
            <Input
              value={url}
              placeholder="https://..."
              onChange={(e) => update(i, e.target.value)}
            />
          </div>
          <div className="flex items-center justify-end gap-1 sm:shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 mt-2 sm:mt-0 border-gray-200">
            <IconButton onClick={() => move(i, -1)}>↑</IconButton>
            <IconButton onClick={() => move(i, 1)}>↓</IconButton>
            <IconButton danger onClick={() => remove(i)}>
              ✕
            </IconButton>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="text-sm text-[#2874f0] font-semibold flex items-center gap-1 hover:opacity-80">
        <span className="text-lg leading-none">+</span> Add image
      </button>
    </div>
  );
};

const NamedImageListField = ({ items = [], onChange }) => {
  const update = (i, field, v) =>
    onChange(items.map((x, idx) => (idx === i ? { ...x, [field]: v } : x)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { name: "", image: "" }]);
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex flex-col lg:flex-row lg:items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <ImagePreview src={item.image} />
          <div className="flex flex-col sm:flex-row flex-1 gap-2">
            <div className="sm:w-1/3">
              <Input
                value={item.name}
                placeholder="Name"
                onChange={(e) => update(i, "name", e.target.value)}
              />
            </div>
            <div className="sm:w-2/3">
              <Input
                value={item.image}
                placeholder="Image URL (https://...)"
                onChange={(e) => update(i, "image", e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-1 lg:shrink-0 border-t lg:border-t-0 pt-2 lg:pt-0 mt-2 lg:mt-0 border-gray-200">
            <IconButton onClick={() => move(i, -1)}>↑</IconButton>
            <IconButton onClick={() => move(i, 1)}>↓</IconButton>
            <IconButton danger onClick={() => remove(i)}>
              ✕
            </IconButton>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="text-sm text-[#2874f0] font-semibold flex items-center gap-1 hover:opacity-80">
        <span className="text-lg leading-none">+</span> Add
      </button>
    </div>
  );
};

/* Hero slides: { image, collection, alt } */
const HeroSlidesField = ({ items = [], onChange }) => {
  const update = (i, field, v) =>
    onChange(items.map((x, idx) => (idx === i ? { ...x, [field]: v } : x)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () =>
    onChange([...items, { image: "", collection: "", alt: "" }]);
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-3">
      {items.map((slide, i) => (
        <div
          key={i}
          className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-3">
          <div className="flex items-center justify-end gap-1">
            <IconButton onClick={() => move(i, -1)}>↑</IconButton>
            <IconButton onClick={() => move(i, 1)}>↓</IconButton>
            <IconButton danger onClick={() => remove(i)}>
              ✕
            </IconButton>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-start gap-3">
            <ImagePreview src={slide.image} />
            <div className="flex-1 space-y-2">
              <Input
                value={slide.image ?? ""}
                placeholder="Image URL (https://...)"
                onChange={(e) => update(i, "image", e.target.value)}
              />
              <Input
                value={slide.collection ?? ""}
                placeholder="Collection link (/collections/...)"
                onChange={(e) => update(i, "collection", e.target.value)}
              />
              <Input
                value={slide.alt ?? ""}
                placeholder="Alt text"
                onChange={(e) => update(i, "alt", e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="text-sm text-[#2874f0] font-semibold flex items-center gap-1 hover:opacity-80">
        <span className="text-lg leading-none">+</span> Add slide
      </button>
    </div>
  );
};

/* Price / promo tiles: { id, title, subtitle, link, image } */
const genTileId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `tile_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const TileListField = ({ items = [], onChange }) => {
  const update = (i, field, v) =>
    onChange(items.map((x, idx) => (idx === i ? { ...x, [field]: v } : x)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () =>
    onChange([
      ...items,
      { id: genTileId(), title: "", subtitle: "", link: "", image: "" },
    ]);
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={item.id ?? i}
          className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400">
              id: {item.id || "—"}
            </span>
            <div className="flex items-center gap-1">
              <IconButton onClick={() => move(i, -1)}>↑</IconButton>
              <IconButton onClick={() => move(i, 1)}>↓</IconButton>
              <IconButton danger onClick={() => remove(i)}>
                ✕
              </IconButton>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <ImagePreview src={item.image} />
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input
                value={item.title ?? ""}
                placeholder="Title"
                onChange={(e) => update(i, "title", e.target.value)}
              />
              <Input
                value={item.subtitle ?? ""}
                placeholder="Subtitle (optional)"
                onChange={(e) => update(i, "subtitle", e.target.value)}
              />
              <Input
                value={item.link ?? ""}
                placeholder="Link (/products?...)"
                onChange={(e) => update(i, "link", e.target.value)}
              />
              <Input
                value={item.image ?? ""}
                placeholder="Image URL (https://...)"
                onChange={(e) => update(i, "image", e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="text-sm text-[#2874f0] font-semibold flex items-center gap-1 hover:opacity-80">
        <span className="text-lg leading-none">+</span> Add tile
      </button>
    </div>
  );
};

/* ---------- generic field-form: renders schema.fields for ANY section type ---------- */
const SectionDataForm = ({ fields, data, onFieldChange }) => (
  <>
    {fields.map((field, i) => (
      <div
        key={field.key}
        className={
          i === 0
            ? "mb-6 last:mb-0"
            : "mb-6 last:mb-0 pt-6 border-t border-gray-100"
        }>
        <h4 className="font-semibold text-gray-700 mb-3 text-sm">
          {field.label}
        </h4>
        {field.type === FIELD.IMAGE_LIST && (
          <ImageListField
            items={data?.[field.key] ?? []}
            onChange={(v) => onFieldChange(field.key, v)}
          />
        )}
        {field.type === FIELD.SINGLE_IMAGE && (
          <SingleImageField
            value={data?.[field.key]}
            onChange={(v) => onFieldChange(field.key, v)}
          />
        )}
        {field.type === FIELD.NAMED_IMAGE_LIST && (
          <NamedImageListField
            items={data?.[field.key] ?? []}
            onChange={(v) => onFieldChange(field.key, v)}
          />
        )}
        {field.type === FIELD.HERO_SLIDES && (
          <HeroSlidesField
            items={data?.[field.key] ?? []}
            onChange={(v) => onFieldChange(field.key, v)}
          />
        )}
        {field.type === FIELD.TILE_LIST && (
          <TileListField
            items={data?.[field.key] ?? []}
            onChange={(v) => onFieldChange(field.key, v)}
          />
        )}
        {field.type === FIELD.TEXT && (
          <Input
            value={data?.[field.key] ?? ""}
            onChange={(e) => onFieldChange(field.key, e.target.value)}
          />
        )}
        {field.type === FIELD.TOGGLE && (
          <ToggleField
            value={!!data?.[field.key]}
            onChange={(v) => onFieldChange(field.key, v)}
          />
        )}
        {field.type === FIELD.DATETIME && (
          <Input
            type="datetime-local"
            value={data?.[field.key] ?? ""}
            onChange={(e) => onFieldChange(field.key, e.target.value)}
          />
        )}
      </div>
    ))}
  </>
);

const NavItem = ({ label, icon, active, dirty, onClick, badge }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors relative ${
      active
        ? "bg-[#2874f0]/10 text-[#2874f0]"
        : "text-gray-600 hover:bg-gray-100"
    }`}>
    <span className="text-base">{icon}</span>
    <span className="flex-1">{label}</span>
    {badge != null && <span className="text-xs text-gray-400">{badge}</span>}
    {dirty && (
      <span
        className="w-2 h-2 rounded-full bg-amber-500 shrink-0"
        title="Unsaved changes"
      />
    )}
  </button>
);

/* ============================================================ */
const AdminSiteConfigPanel = () => {
  const { admin } = useAdminAuth();

  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(SINGLETON_TYPES[0]?.id);
  const [instances, setInstances] = useState({}); // id -> {id, type, enabled, order, data}
  const [saved, setSaved] = useState({});
  const [deletedIds, setDeletedIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const loadFresh = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const { data } = await getSiteConfig({ forceRefresh: true });
      const byId = {};
      data.sections.forEach((s) => {
        byId[s.id] = s;
      });
      setInstances(byId);
      setSaved(byId);
      setDeletedIds([]);
    } catch (err) {
      // siteConfigService already alerts the person — this just keeps the
      // panel from spinning forever and gives a persistent inline note.
      console.error(err);
      setStatus({
        type: "error",
        msg: "Failed to load site config. Check console for details.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin) loadFresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin]);

  const dirty = useMemo(() => {
    const ids = new Set([...Object.keys(instances), ...Object.keys(saved)]);
    const result = {};
    ids.forEach((id) => {
      result[id] = JSON.stringify(instances[id]) !== JSON.stringify(saved[id]);
    });
    return result;
  }, [instances, saved]);

  if (!admin)
    return (
      <div className="p-8 text-center text-gray-500">
        Loading admin environment…
      </div>
    );
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-[#2874f0] rounded-full animate-spin" />
      </div>
    );
  }

  const activeType = SECTION_TYPES.find((t) => t.id === activeId);
  const isRepeatableTab = activeType && !activeType.singleton;
  const singletonInstance = !isRepeatableTab ? instances[activeId] : null;
  const repeatableInstances = isRepeatableTab
    ? Object.values(instances)
        .filter((i) => i.type === activeType.id)
        .sort((a, b) => a.order - b.order)
    : [];

  const updateSingletonField = (key, value) =>
    setInstances((prev) => ({
      ...prev,
      [activeId]: {
        ...prev[activeId],
        data: { ...prev[activeId].data, [key]: value },
      },
    }));
  const updateSingletonMeta = (key, value) =>
    setInstances((prev) => ({
      ...prev,
      [activeId]: { ...prev[activeId], [key]: value },
    }));

  const updateInstance = (id, patch) =>
    setInstances((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  const updateInstanceField = (id, key, value) =>
    setInstances((prev) => ({
      ...prev,
      [id]: { ...prev[id], data: { ...prev[id].data, [key]: value } },
    }));

  const addInstance = () => {
    const type = activeType;
    const maxOrder = repeatableInstances.reduce(
      (m, i) => Math.max(m, i.order ?? 0),
      type.defaultOrder,
    );
    const id = `${type.id}_${Date.now()}`;
    const instance = buildRepeatableInstance(type, id);
    setInstances((prev) => ({
      ...prev,
      [id]: { ...instance, order: maxOrder + 10 },
    }));
  };
  const removeInstance = (id) => {
    setInstances((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (saved[id]) setDeletedIds((prev) => [...prev, id]);
  };

  const handleDiscard = () => {
    if (isRepeatableTab) {
      setInstances((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((id) => {
          if (next[id].type === activeType.id && !saved[id]) delete next[id];
        });
        Object.values(saved).forEach((s) => {
          if (s.type === activeType.id) next[s.id] = s;
        });
        return next;
      });
      setDeletedIds((prev) =>
        prev.filter((id) => saved[id]?.type !== activeType.id),
      );
    } else {
      setInstances((prev) => ({ ...prev, [activeId]: saved[activeId] }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      if (isRepeatableTab) {
        const toSave = repeatableInstances;
        const toDelete = deletedIds.filter(
          (id) => saved[id]?.type === activeType.id,
        );
        if (toSave.length) await saveSectionsBatch(toSave);
        for (const id of toDelete) await deleteSectionInstance(id);
      } else {
        const inst = instances[activeId];
        const remote = await getSectionInstanceRaw(activeId);
        const remoteAt = remote?.updatedAt?.toMillis?.() ?? null;
        const localAt = saved[activeId]?.updatedAt?.toMillis?.() ?? null;
        if (remote && remoteAt && localAt && remoteAt !== localAt) {
          const proceed = window.confirm(
            "This section was edited elsewhere since you loaded it. Overwrite?",
          );
          if (!proceed) {
            setSaving(false);
            return;
          }
        }
        await saveSectionInstance(activeId, inst);
      }
      await loadFresh();
      setStatus({ type: "success", msg: "Saved successfully." });
    } catch (err) {
      // siteConfigService already alerts — this keeps a visible inline
      // record of the failure too, and stops the button spinner.
      console.error(err);
      setStatus({
        type: "error",
        msg: "Failed to save. Check console for details.",
      });
    } finally {
      setSaving(false);
    }
  };

  const activeDirty = isRepeatableTab
    ? Object.keys(instances).some(
        (id) => instances[id].type === activeType.id && dirty[id],
      ) || deletedIds.some((id) => saved[id]?.type === activeType.id)
    : dirty[activeId];

  return (
    <div className="bg-[#f1f3f6] min-h-screen">
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-5 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              App Content Manager
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Sections come from <code>homepageSchema.js</code> — add one there
              and it shows up here automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={loadFresh}
            disabled={loading || saving}
            className="text-sm px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm w-full sm:w-auto font-medium">
            ↻ Reload latest
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {status && (
          <div
            className={`mb-6 text-sm px-4 py-3 rounded-lg flex items-center shadow-sm ${
              status.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}>
            <span className="mr-2">
              {status.type === "success" ? "✓" : "⚠"}
            </span>
            {status.msg}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          <aside className="md:w-56 shrink-0">
            <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 -mx-1 px-1 md:mx-0 md:px-0">
              {SINGLETON_TYPES.map((t) => (
                <div key={t.id} className="shrink-0 md:shrink md:w-full">
                  <NavItem
                    label={t.label}
                    icon={t.icon}
                    active={activeId === t.id}
                    dirty={dirty[t.id]}
                    onClick={() => setActiveId(t.id)}
                  />
                </div>
              ))}
              {REPEATABLE_TYPES.map((t) => (
                <div key={t.id} className="shrink-0 md:shrink md:w-full">
                  <NavItem
                    label={t.label}
                    icon={t.icon}
                    active={activeId === t.id}
                    badge={
                      Object.values(instances).filter((i) => i.type === t.id)
                        .length
                    }
                    dirty={
                      Object.keys(instances).some(
                        (id) => instances[id].type === t.id && dirty[id],
                      ) || deletedIds.some((id) => saved[id]?.type === t.id)
                    }
                    onClick={() => setActiveId(t.id)}
                  />
                </div>
              ))}
            </nav>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-5 py-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">
                  {activeType?.label}
                </h3>
                {activeDirty && (
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                    Unsaved changes
                  </span>
                )}
              </div>

              <div className="p-5 sm:p-6">
                {!isRepeatableTab && singletonInstance && (
                  <>
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">
                          Enabled
                        </span>
                        <ToggleField
                          value={singletonInstance.enabled}
                          onChange={(v) => updateSingletonMeta("enabled", v)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          Order
                        </span>
                        <input
                          type="number"
                          className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm"
                          value={singletonInstance.order}
                          onChange={(e) =>
                            updateSingletonMeta("order", Number(e.target.value))
                          }
                        />
                      </div>
                    </div>
                    {activeType.fields.length > 0 ? (
                      <SectionDataForm
                        fields={activeType.fields}
                        data={singletonInstance.data}
                        onFieldChange={updateSingletonField}
                      />
                    ) : (
                      <p className="text-sm text-gray-400">
                        This section has no editable content — only
                        enabled/order.
                      </p>
                    )}
                  </>
                )}

                {isRepeatableTab && (
                  <div className="space-y-4">
                    {repeatableInstances.map((inst) => (
                      <div
                        key={inst.id}
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-mono bg-blue-50 text-[#2874f0] border border-blue-100 px-2 py-1 rounded">
                            id: {inst.id}
                          </span>
                          <div className="flex items-center gap-3">
                            <ToggleField
                              value={inst.enabled}
                              onChange={(v) =>
                                updateInstance(inst.id, { enabled: v })
                              }
                            />
                            <input
                              type="number"
                              className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-xs"
                              value={inst.order}
                              onChange={(e) =>
                                updateInstance(inst.id, {
                                  order: Number(e.target.value),
                                })
                              }
                            />
                            <IconButton
                              danger
                              onClick={() => removeInstance(inst.id)}>
                              ✕
                            </IconButton>
                          </div>
                        </div>
                        <SectionDataForm
                          fields={activeType.fields}
                          data={inst.data}
                          onFieldChange={(key, v) =>
                            updateInstanceField(inst.id, key, v)
                          }
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addInstance}
                      className="text-sm text-[#2874f0] font-semibold flex items-center gap-1 hover:opacity-80">
                      <span className="text-lg leading-none">+</span> Add{" "}
                      {activeType.label.replace(/s$/, "")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {activeDirty && (
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] px-4 sm:px-6 lg:px-8 py-4 z-10">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              Unsaved changes in <strong>{activeType?.label}</strong>.
            </span>
            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={handleDiscard}
                disabled={saving}
                className="text-sm px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-colors font-medium">
                Discard
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="bg-[#2874f0] hover:bg-[#1a5cbf] text-white font-medium px-6 py-2 rounded-lg shadow-sm shadow-blue-200 disabled:opacity-50 transition-colors">
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSiteConfigPanel;
