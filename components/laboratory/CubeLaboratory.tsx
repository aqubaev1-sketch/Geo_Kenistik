"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent, type WheelEvent } from "react";
import { Box, ChevronDown, ChevronUp, Eye, Grid3X3, MousePointer2, RotateCcw, Scissors, ZoomIn } from "lucide-react";

type Mode = "cube" | "net";
type Shape = "cube" | "tetrahedron" | "pyramid" | "prism" | "octahedron";
type RenderStyle = "glass" | "solid" | "wireframe";
type Point = readonly [number, number];

const shapes: { id: Shape; name: string }[] = [
  { id: "cube", name: "Куб" },
  { id: "tetrahedron", name: "Тетраэдр" },
  { id: "pyramid", name: "Пирамида" },
  { id: "prism", name: "Призма" },
  { id: "octahedron", name: "Октаэдр" },
];

const geometry: Record<Shape, { vertices: number[][]; faces: number[][] }> = {
  cube: {
    vertices: [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],
    faces: [[0,1,2,3],[4,7,6,5],[0,4,5,1],[3,2,6,7],[1,5,6,2],[0,3,7,4]],
  },
  tetrahedron: {
    vertices: [[1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]],
    faces: [[0, 1, 2], [0, 3, 1], [0, 2, 3], [1, 3, 2]],
  },
  pyramid: {
    vertices: [[-1, -1, 1], [1, -1, 1], [1, -1, -1], [-1, -1, -1], [0, 1.35, 0]],
    faces: [[0, 3, 2, 1], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]],
  },
  prism: {
    vertices: [[-1, -1, .8], [1, -1, .8], [0, 1, .8], [-1, -1, -.8], [1, -1, -.8], [0, 1, -.8]],
    faces: [[0, 1, 2], [5, 4, 3], [0, 3, 4, 1], [1, 4, 5, 2], [2, 5, 3, 0]],
  },
  octahedron: {
    vertices: [[1.15, 0, 0], [-1.15, 0, 0], [0, 1.15, 0], [0, -1.15, 0], [0, 0, 1.15], [0, 0, -1.15]],
    faces: [[2, 0, 4], [2, 4, 1], [2, 1, 5], [2, 5, 0], [3, 4, 0], [3, 1, 4], [3, 5, 1], [3, 0, 5]],
  },
};

const cubeEdges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]] as const;

function computeCubeSection(tiltDeg: number, offset: number) {
  const angle = tiltDeg * Math.PI / 180;
  const raw = [Math.sin(angle), .72 * Math.cos(angle), .7 * Math.cos(angle)];
  const length = Math.hypot(...raw);
  const normal = raw.map((value) => value / length);
  const vertices = geometry.cube.vertices;
  const points: number[][] = [];
  for (const [a, b] of cubeEdges) {
    const p = vertices[a], q = vertices[b];
    const da = p[0]*normal[0] + p[1]*normal[1] + p[2]*normal[2] - offset;
    const db = q[0]*normal[0] + q[1]*normal[1] + q[2]*normal[2] - offset;
    if (Math.abs(da) < 1e-8) points.push([...p]);
    if (da * db < -1e-8) {
      const t = da / (da - db);
      points.push(p.map((value, i) => value + t * (q[i] - value)));
    }
  }
  const unique = points.filter((point, index) => points.findIndex((other) => Math.hypot(...point.map((value, i) => value - other[i])) < 1e-6) === index);
  if (unique.length < 3) return { points: [], area: 0, perimeter: 0, name: "Қима жоқ" };
  const center = [0,1,2].map((i) => unique.reduce((sum, point) => sum + point[i], 0) / unique.length);
  const helper = Math.abs(normal[2]) < .9 ? [0,0,1] : [0,1,0];
  const uRaw = [normal[1]*helper[2]-normal[2]*helper[1], normal[2]*helper[0]-normal[0]*helper[2], normal[0]*helper[1]-normal[1]*helper[0]];
  const uLen = Math.hypot(...uRaw); const u = uRaw.map((v) => v/uLen);
  const v = [normal[1]*u[2]-normal[2]*u[1], normal[2]*u[0]-normal[0]*u[2], normal[0]*u[1]-normal[1]*u[0]];
  const ordered = [...unique].sort((a,b) => {
    const angleOf = (p:number[]) => Math.atan2(p.reduce((s,x,i)=>s+(x-center[i])*v[i],0), p.reduce((s,x,i)=>s+(x-center[i])*u[i],0));
    return angleOf(a)-angleOf(b);
  });
  let area = 0, perimeter = 0;
  for (let i=0;i<ordered.length;i++) {
    const a=ordered[i], b=ordered[(i+1)%ordered.length];
    const ax=a.reduce((s,x,j)=>s+(x-center[j])*u[j],0), ay=a.reduce((s,x,j)=>s+(x-center[j])*v[j],0);
    const bx=b.reduce((s,x,j)=>s+(x-center[j])*u[j],0), by=b.reduce((s,x,j)=>s+(x-center[j])*v[j],0);
    area += ax*by-ay*bx; perimeter += Math.hypot(...a.map((x,j)=>x-b[j]));
  }
  const names: Record<number,string> = {3:"Үшбұрыш",4:"Төртбұрыш",5:"Бесбұрыш",6:"Алтыбұрыш"};
  return { points: ordered, area: Math.abs(area)/2, perimeter, name: names[ordered.length] ?? `${ordered.length}-бұрыш` };
}

const nets: { name: string; cells: Point[] }[] = [
  { name: "T-тәрізді", cells: [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]] },
  { name: "Айқыш", cells: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2], [1, 3]] },
  { name: "Сатылы", cells: [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2], [3, 2]] },
  { name: "Ұзын", cells: [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [3, 2]] },
];

const faces = [
  ["Алдыңғы", "translateZ(84px)"],
  ["Артқы", "rotateY(180deg) translateZ(84px)"],
  ["Оң", "rotateY(90deg) translateZ(84px)"],
  ["Сол", "rotateY(-90deg) translateZ(84px)"],
  ["Үсті", "rotateX(90deg) translateZ(84px)"],
  ["Асты", "rotateX(-90deg) translateZ(84px)"],
] as const;

function NetDrawing({ cells, compact = false }: { cells: Point[]; compact?: boolean }) {
  const size = 30;
  const padding = 5;
  return (
    <svg viewBox="0 0 130 130" className={compact ? "h-20 w-20" : "h-full w-full"} aria-hidden="true">
      {cells.map(([x, y], index) => (
        <g key={`${x}-${y}`}>
          <rect
            x={padding + x * size}
            y={padding + y * size}
            width={size}
            height={size}
            rx="3"
            className="fill-indigo-50 stroke-indigo-500"
            strokeWidth="2"
          />
          {!compact && (
            <text x={padding + x * size + 15} y={padding + y * size + 19} textAnchor="middle" className="fill-indigo-700 text-[10px] font-bold">
              {index + 1}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

function Polyhedron({ shape, rotation, scale, renderStyle, sectionEnabled, sectionTilt, sectionOffset }: { shape: Shape; rotation: { x: number; y: number }; scale: number; renderStyle: RenderStyle; sectionEnabled: boolean; sectionTilt: number; sectionOffset: number }) {
  const projected = useMemo(() => {
    const data = geometry[shape];
    const rx = rotation.x * Math.PI / 180;
    const ry = rotation.y * Math.PI / 180;
    const vertices = data.vertices.map(([x, y, z]) => {
      const x1 = x * Math.cos(ry) + z * Math.sin(ry);
      const z1 = -x * Math.sin(ry) + z * Math.cos(ry);
      const y1 = y * Math.cos(rx) - z1 * Math.sin(rx);
      const z2 = y * Math.sin(rx) + z1 * Math.cos(rx);
      return { x: 150 + x1 * 78 * scale, y: 150 - y1 * 78 * scale, z: z2 };
    });
    const faces = data.faces.map((face, index) => ({ face, index, depth: face.reduce((sum, vertex) => sum + vertices[vertex].z, 0) / face.length })).sort((a, b) => a.depth - b.depth);
    const transformPoint = ([x,y,z]:number[]) => {
      const x1=x*Math.cos(ry)+z*Math.sin(ry), z1=-x*Math.sin(ry)+z*Math.cos(ry);
      const y1=y*Math.cos(rx)-z1*Math.sin(rx), z2=y*Math.sin(rx)+z1*Math.cos(rx);
      return { x:150+x1*78*scale, y:150-y1*78*scale, z:z2 };
    };
    const section = shape === "cube" && sectionEnabled ? computeCubeSection(sectionTilt, sectionOffset).points.map(transformPoint) : [];
    return { vertices, faces, section };
  }, [rotation, scale, sectionEnabled, sectionOffset, sectionTilt, shape]);

  const colors = ["#c7d2fe", "#a5b4fc", "#ddd6fe", "#bfdbfe", "#c4b5fd", "#bae6fd", "#e0e7ff", "#dbeafe"];
  return (
    <svg viewBox="0 0 300 300" className="h-[300px] w-[300px] max-w-full overflow-visible" role="img" aria-label={`${shapes.find((item) => item.id === shape)?.name} моделі`}>
      {projected.faces.map(({ face, index, depth }) => (
        <polygon
          key={`${shape}-${index}`}
          points={face.map((vertex) => `${projected.vertices[vertex].x},${projected.vertices[vertex].y}`).join(" ")}
          fill={renderStyle === "wireframe" ? "transparent" : renderStyle === "solid" ? colors[index % colors.length] : "#7dd3fc"}
          fillOpacity={renderStyle === "wireframe" ? 0 : renderStyle === "solid" ? (depth < 0 ? .5 : .86) : (depth < 0 ? .16 : .34)}
          stroke="#4f46e5"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      ))}
      {sectionEnabled && shape !== "cube" && (
        <g transform={`translate(0 ${sectionOffset * -55}) rotate(${sectionTilt} 150 150)`}>
          <polygon points="48,126 252,126 224,178 76,178" fill="#fbbf24" fillOpacity=".32" stroke="#d97706" strokeWidth="2" />
          <line x1="48" y1="152" x2="252" y2="152" stroke="#d97706" strokeWidth="2" strokeDasharray="6 5" />
        </g>
      )}
      {projected.section.length >= 3 && <polygon points={projected.section.map((point) => `${point.x},${point.y}`).join(" ")} fill="#f59e0b" fillOpacity=".62" stroke="#b45309" strokeWidth="3" strokeLinejoin="round" />}
      {projected.vertices.map((vertex, index) => <circle key={index} cx={vertex.x} cy={vertex.y} r="3.5" fill="#4338ca" />)}
    </svg>
  );
}

function FoldingCube({ ratio }: { ratio: number }) {
  const configs = [
    { rx:0, ry:0, z:32, x:0, y:0 }, { rx:0, ry:180, z:32, x:128, y:0 },
    { rx:0, ry:90, z:32, x:64, y:0 }, { rx:0, ry:-90, z:32, x:-64, y:0 },
    { rx:90, ry:0, z:32, x:0, y:-64 }, { rx:-90, ry:0, z:32, x:0, y:64 },
  ];
  return <div className="relative h-[300px] w-[360px] max-w-full [perspective:900px]">
    <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 [transform-style:preserve-3d]">
      {configs.map((face,index) => <div key={index} className="absolute inset-0 grid place-items-center border-2 border-indigo-500 bg-indigo-200/80 text-sm font-bold text-indigo-900 shadow-sm transition-transform duration-75" style={{ transform: `translate3d(${face.x*ratio}px,${face.y*ratio}px,${face.z*(1-ratio)}px) rotateX(${face.rx*(1-ratio)}deg) rotateY(${face.ry*(1-ratio)}deg)` }}>{index+1}</div>)}
    </div>
  </div>;
}

export function CubeLaboratory() {
  const [mode, setMode] = useState<Mode>("cube");
  const [shape, setShape] = useState<Shape>("cube");
  const [rotation, setRotation] = useState({ x: -22, y: 34 });
  const [scale, setScale] = useState(1);
  const [selectedNet, setSelectedNet] = useState(0);
  const [dockExpanded, setDockExpanded] = useState(true);
  const [renderStyle, setRenderStyle] = useState<RenderStyle>("glass");
  const [autoRotate, setAutoRotate] = useState(false);
  const [sectionEnabled, setSectionEnabled] = useState(false);
  const [sectionTilt, setSectionTilt] = useState(-18);
  const [sectionOffset, setSectionOffset] = useState(0);
  const [unfoldRatio, setUnfoldRatio] = useState(0);
  const [unfolding, setUnfolding] = useState(false);
  const drag = useRef<{ x: number; y: number; rx: number; ry: number } | null>(null);

  const reset = () => {
    setRotation({ x: -22, y: 34 });
    setScale(1);
  };

  const chooseShape = (nextShape: Shape) => {
    setShape(nextShape);
    setMode("cube");
    reset();
  };

  useEffect(() => {
    if (!autoRotate || mode !== "cube") return;
    const timer = window.setInterval(() => setRotation((current) => ({ ...current, y: current.y + .7 })), 30);
    return () => window.clearInterval(timer);
  }, [autoRotate, mode]);

  useEffect(() => {
    if (!unfolding) return;
    const target = unfoldRatio < .5 ? 1 : 0;
    const timer = window.setInterval(() => setUnfoldRatio((current) => {
      const next = Math.max(0, Math.min(1, current + (target ? .04 : -.04)));
      if (next === target) setUnfolding(false);
      return next;
    }), 30);
    return () => window.clearInterval(timer);
  }, [unfolding]);

  const cubeSection = useMemo(() => computeCubeSection(sectionTilt, sectionOffset), [sectionTilt, sectionOffset]);

  const cameraPreset = (preset: "iso" | "front" | "top" | "side") => {
    const presets = { iso: { x: -22, y: 34 }, front: { x: 0, y: 0 }, top: { x: -80, y: 0 }, side: { x: 0, y: 90 } };
    setRotation(presets[preset]);
  };

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (mode !== "cube") return;
    const target = event.target as HTMLElement;
    if (target.closest("button, input, a, [data-no-drag]")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, rx: rotation.x, ry: rotation.y };
  };

  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current || mode !== "cube") return;
    setRotation({
      x: Math.max(-80, Math.min(80, drag.current.rx - (event.clientY - drag.current.y) * 0.45)),
      y: drag.current.ry + (event.clientX - drag.current.x) * 0.45,
    });
  };

  const stopDrag = () => {
    drag.current = null;
  };

  const zoom = (event: WheelEvent<HTMLDivElement>) => {
    if (mode !== "cube") return;
    event.preventDefault();
    setScale((current) => Math.max(0.7, Math.min(1.45, current - event.deltaY * 0.001)));
  };

  return (
    <section className="overflow-hidden rounded-[30px] border border-indigo-100 bg-white shadow-[0_24px_70px_rgba(79,70,229,0.10)]">
      <div className="flex flex-col gap-4 border-b border-indigo-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Кубты зерттеу</h2>
          <p className="mt-1 text-sm text-slate-500">Модельді бұрып, дене мен оның жазбасының байланысын бақылаңыз.</p>
        </div>
        <div className="inline-flex w-fit rounded-2xl bg-slate-100 p-1" aria-label="Көрініс режимі">
          <button onClick={() => setMode("cube")} aria-pressed={mode === "cube"} className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold transition ${mode === "cube" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}>
            <Box className="h-4 w-4" /> Дене
          </button>
          <button onClick={() => setMode("net")} disabled={shape !== "cube"} title={shape !== "cube" ? "Жазба әзірге куб үшін қолжетімді" : undefined} aria-pressed={mode === "net"} className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${mode === "net" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}>
            <Grid3X3 className="h-4 w-4" /> Жазба
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_340px]">
        <div
          className={`relative grid min-h-[600px] select-none place-items-center overflow-hidden bg-[#f5f7ff] p-8 pb-48 [background-image:linear-gradient(rgba(99,102,241,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,.08)_1px,transparent_1px)] [background-size:32px_32px] ${mode === "cube" ? "cursor-grab active:cursor-grabbing" : ""}`}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
          onWheel={zoom}
        >
          <div className="absolute left-5 top-5 rounded-xl border border-indigo-100 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm backdrop-blur">
            {mode === "cube" ? "Тінтуірмен бұрыңыз · дөңгелекпен масштабтаңыз" : nets[selectedNet].name}
          </div>

          {mode === "cube" && shape === "cube" && unfoldRatio > .001 ? (
            <FoldingCube ratio={unfoldRatio} />
          ) : mode === "cube" && shape === "cube" && sectionEnabled ? (
            <Polyhedron shape="cube" rotation={rotation} scale={scale} renderStyle={renderStyle} sectionEnabled={sectionEnabled} sectionTilt={sectionTilt} sectionOffset={sectionOffset} />
          ) : mode === "cube" && shape === "cube" ? (
            <div className="grid h-[280px] w-[280px] place-items-center [perspective:800px]" aria-label="Интерактивті үшөлшемді куб">
              <div
                className="relative h-[168px] w-[168px] [transform-style:preserve-3d] transition-transform duration-75 ease-out"
                style={{ transform: `scale(${scale}) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
              >
                {faces.map(([label, transform], index) => (
                  <div key={label} className={`absolute inset-0 grid place-items-center border-2 border-indigo-500/70 text-sm font-bold text-indigo-950 [backface-visibility:visible] ${renderStyle === "wireframe" ? "bg-transparent" : renderStyle === "solid" ? "bg-indigo-200/90 shadow-[inset_0_0_30px_rgba(99,102,241,.16)]" : "bg-sky-300/20 shadow-[inset_0_0_30px_rgba(14,165,233,.10)]"}`} style={{ transform }}>
                    <span className="rounded-lg bg-white/75 px-2 py-1 backdrop-blur-sm">{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : mode === "cube" ? (
            <Polyhedron shape={shape} rotation={rotation} scale={scale} renderStyle={renderStyle} sectionEnabled={sectionEnabled} sectionTilt={sectionTilt} sectionOffset={sectionOffset} />
          ) : (
            <div className="h-[320px] w-[320px] max-w-full rounded-[28px] border border-indigo-100 bg-white/80 p-7 shadow-sm backdrop-blur-sm">
              <NetDrawing cells={nets[selectedNet].cells} />
            </div>
          )}

          <div data-no-drag className="absolute bottom-4 left-0 right-0 z-10 flex flex-col items-center px-3" onPointerDown={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setDockExpanded((value) => !value)} className="mb-2 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs font-bold text-slate-600 shadow-sm">
              {dockExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}{dockExpanded ? "Сахна панелін жасыру" : "Сахна панелін көрсету"}
            </button>
            {dockExpanded && <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm">
              <div className="flex flex-wrap gap-2" aria-label="Геометриялық денені таңдау">
                {shapes.map((item) => <button type="button" key={item.id} onClick={() => chooseShape(item.id)} className={`rounded-lg px-3 py-2 text-xs font-bold ${shape === item.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>{item.name}</button>)}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2">
                {([['iso','3D изометрия'],['front','Алдынан'],['top','Үстінен'],['side','Жанынан']] as const).map(([id,label]) => <button type="button" key={id} onClick={() => cameraPreset(id)} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-indigo-50">{label}</button>)}
                <span className="mx-1 h-6 w-px bg-slate-200" />
                {([['glass','Шыны'],['solid','Қатты'],['wireframe','Қаңқа']] as const).map(([id,label]) => <button type="button" key={id} onClick={() => setRenderStyle(id)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${renderStyle === id ? "bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-200" : "bg-slate-100 text-slate-600"}`}>{label}</button>)}
                <button type="button" onClick={reset} className="ml-auto inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600"><RotateCcw className="h-3.5 w-3.5" /> Қалпына келтіру</button>
              </div>
            </div>}
          </div>
          <div className="absolute bottom-[168px] left-5 flex items-center gap-2 text-xs font-semibold text-slate-500">
            {mode === "cube" ? <><MousePointer2 className="h-4 w-4 text-indigo-500" /> Бұру <ZoomIn className="ml-2 h-4 w-4 text-indigo-500" /> {Math.round(scale * 100)}%</> : "Жазбадағы алты шаршы — кубтың алты жағы"}
          </div>
        </div>

        <aside className="border-t border-indigo-100 bg-white p-6 lg:border-l lg:border-t-0 lg:p-7">
          {mode === "cube" ? (
            <>
              <div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-900">{shapes.find((item) => item.id === shape)?.name}: бақылау</p><button onClick={() => setAutoRotate((value) => !value)} className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold ${autoRotate ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}><Eye className="h-3.5 w-3.5" />{autoRotate ? "Тоқтату" : "Айналдыру"}</button></div>
              <p className="mt-2 text-sm leading-6 text-slate-500">Денені әр бағытқа бұрып, оның жақтары, қырлары мен төбелерінің орналасуын зерттеңіз.</p>
              <div className="mt-6 space-y-3 rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-950">
                {shape === "cube" ? <><p><b>6</b> жағы</p><p><b>12</b> қыры</p><p><b>8</b> төбесі</p></> :
                 shape === "tetrahedron" ? <><p><b>4</b> жағы</p><p><b>6</b> қыры</p><p><b>4</b> төбесі</p></> :
                 shape === "pyramid" ? <><p><b>5</b> жағы</p><p><b>8</b> қыры</p><p><b>5</b> төбесі</p></> :
                 shape === "prism" ? <><p><b>5</b> жағы</p><p><b>9</b> қыры</p><p><b>6</b> төбесі</p></> :
                 <><p><b>8</b> жағы</p><p><b>12</b> қыры</p><p><b>6</b> төбесі</p></>}
              </div>
              {shape === "cube" && <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-sm font-bold text-slate-900"><Grid3X3 className="h-4 w-4 text-indigo-600" /> Кубты бүктеу</span><b className="text-xs text-indigo-600">{Math.round(unfoldRatio * 100)}%</b></div>
                <input aria-label="Куб жазбасының ашылу деңгейі" type="range" min="0" max="100" value={Math.round(unfoldRatio*100)} onChange={(event) => { setUnfolding(false); setSectionEnabled(false); setUnfoldRatio(Number(event.target.value)/100); }} className="mt-4 w-full accent-indigo-600" />
                <div className="mt-1 flex justify-between text-[11px] text-slate-500"><span>Жиналған</span><span>Жазба</span></div>
                <button type="button" onClick={() => { setSectionEnabled(false); setUnfolding(true); }} className="mt-3 w-full rounded-xl bg-indigo-600 px-3 py-2.5 text-xs font-bold text-white">{unfoldRatio < .5 ? "Біртіндеп ашу" : "Біртіндеп жинау"}</button>
              </div>}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-sm font-bold text-slate-900"><Scissors className="h-4 w-4 text-amber-600" /> Жазықтықпен қима</span><button onClick={() => { setUnfoldRatio(0); setSectionEnabled((value) => !value); }} className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${sectionEnabled ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600"}`}>{sectionEnabled ? "Қосулы" : "Қосу"}</button></div>
                <label className="mt-4 block text-xs font-semibold text-slate-600">Жазықтық көлбеулігі: {sectionTilt}°<input type="range" min="-70" max="70" value={sectionTilt} onChange={(event) => { setSectionTilt(Number(event.target.value)); setSectionEnabled(true); }} className="mt-2 w-full accent-amber-500" /></label>
                <label className="mt-3 block text-xs font-semibold text-slate-600">Ығысу: {sectionOffset.toFixed(1)}<input type="range" min="-1" max="1" step="0.1" value={sectionOffset} onChange={(event) => { setSectionOffset(Number(event.target.value)); setSectionEnabled(true); }} className="mt-2 w-full accent-amber-500" /></label>
                {shape === "cube" && sectionEnabled && <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950"><div className="flex items-center justify-between font-bold"><span>Қима пішіні</span><span>{cubeSection.name}</span></div><div className="mt-3 grid grid-cols-3 gap-2 text-center"><div><span className="block text-[10px] text-amber-700">Төбе</span><b>{cubeSection.points.length}</b></div><div><span className="block text-[10px] text-amber-700">Аудан</span><b>{cubeSection.area.toFixed(2)}</b></div><div><span className="block text-[10px] text-amber-700">Периметр</span><b>{cubeSection.perimeter.toFixed(2)}</b></div></div></div>}
              </div>
              <button onClick={reset} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-white px-4 text-sm font-bold text-indigo-600 transition hover:bg-indigo-50 focus-visible:ring-2 focus-visible:ring-indigo-500">
                <RotateCcw className="h-4 w-4" /> Бастапқы қалпына келтіру
              </button>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-slate-900">Дайын жазбалар</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Үлкейтіп көру үшін жазбаны таңдаңыз.</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {nets.map((net, index) => (
                  <button key={net.name} onClick={() => setSelectedNet(index)} aria-pressed={selectedNet === index} className={`rounded-2xl border p-2 text-center transition focus-visible:ring-2 focus-visible:ring-indigo-500 ${selectedNet === index ? "border-indigo-500 bg-indigo-50 shadow-sm" : "border-slate-200 bg-white hover:border-indigo-200"}`}>
                    <NetDrawing cells={net.cells} compact />
                    <span className="block text-xs font-bold text-slate-700">{index + 1}-жазба</span>
                  </button>
                ))}
              </div>
              <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">Келесі нұсқада әр бетті еркін бүктеп тексеру мүмкіндігі қосылады.</div>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
