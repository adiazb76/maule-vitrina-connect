import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Download,
  RotateCcw,
  Route as RouteIcon,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/diagnostico")({
  head: () => ({
    meta: [
      { title: "DiagnÃ³stico del Emprendedor" },
      {
        name: "description",
        content:
          "EvaluaciÃ³n integral para orientar decisiones, identificar brechas y definir prioridades de desarrollo.",
      },
    ],
  }),
  component: DiagnosticoPage,
});

type AnswerMap = Record<string, string>;
type Severity = "ok" | "warning" | "critical" | "info";
type Dimension =
  | "FormalizaciÃ³n"
  | "Tributario"
  | "Municipal y permisos"
  | "Finanzas"
  | "Mercado y ventas"
  | "OperaciÃ³n"
  | "Personas"
  | "Digital"
  | "Riesgos"
  | "Crecimiento"
  | "Sectorial";

type Option = {
  value: string;
  label: string;
  score?: number;
  severity?: Severity;
  action?: string;
  organism?: string;
};

type Question = {
  id: string;
  section: string;
  dimension?: Dimension;
  title: string;
  options: Option[];
  when?: (a: AnswerMap) => boolean;
};

const STORAGE_KEY = "diagnostico-emprendedor-v1";

const sectors = [
  ["agricultura", "Agricultura / producciÃ³n rural"],
  ["pesca", "Pesca artesanal / recursos del mar"],
  ["gastronomia", "Alimentos / gastronomÃ­a"],
  ["comercio", "Comercio / venta de productos"],
  ["feria", "Feria / comercio itinerante"],
  ["artesania", "ArtesanÃ­a / oficios productivos"],
  ["pasajeros", "Taxi / colectivo / transporte de pasajeros"],
  ["carga", "Camiones / fletes / transporte de carga"],
  ["construccion", "ConstrucciÃ³n / oficio tÃ©cnico"],
  ["turismo", "Turismo / alojamiento / experiencias"],
  ["profesional", "Servicios profesionales"],
  ["personal", "Servicios personales"],
  ["belleza", "Belleza / estÃ©tica"],
  ["educacion", "EducaciÃ³n / capacitaciÃ³n"],
  ["musica", "MÃºsica / arte / espectÃ¡culos"],
  ["manufactura", "Manufactura / fabricaciÃ³n"],
  ["tecnologia", "TecnologÃ­a / servicios digitales"],
  ["otro", "Otra actividad"],
] as const;

const yesNo = (
  action: string,
  organism?: string,
): Option[] => [
  { value: "si", label: "SÃ­, completamente", score: 4, severity: "ok" },
  { value: "parcial", label: "Parcialmente / en proceso", score: 2, severity: "warning", action, organism },
  { value: "no", label: "No", score: 0, severity: "critical", action, organism },
  { value: "nose", label: "No sÃ© / necesito orientaciÃ³n", score: 1, severity: "warning", action, organism },
];

const sectorIs =
  (...values: string[]) =>
  (a: AnswerMap) =>
    values.includes(a.sector);

const hasWorkers = (a: AnswerMap) =>
  ["familia", "contratados", "externos"].includes(a.personas);

const hasPremises = (a: AnswerMap) =>
  ["casa", "local", "taller", "feria", "via", "terreno", "varios"].includes(a.lugar);

const foodActivity = (a: AnswerMap) =>
  a.sector === "gastronomia" || ["elabora", "almacena"].includes(a.alimentos);

const hasFormalTaxStart = (a: AnswerMap) =>
  ["si", "tramite"].includes(a.sii);

const isPreFormal = (a: AnswerMap) =>
  ["no", "nose", "aun", undefined].includes(a.sii as any);

const canAskOperationalCompliance = (a: AnswerMap) =>
  hasFormalTaxStart(a);

const questions: Question[] = [
  {
    id: "nombre_emprendimiento",
    section: "IdentificaciÃ³n",
    when: (a) => a._profile_bound !== "yes",
    title: "Â¿CÃ³mo se llama tu emprendimiento?",
    options: [
      { value: "registrado", label: "UsarÃ© el nombre registrado en mi ficha" },
      { value: "sin_nombre", label: "TodavÃ­a no tiene nombre" },
    ],
  },
  {
    id: "nombre_emprendedor",
    section: "IdentificaciÃ³n",
    when: (a) => a._profile_bound !== "yes",
    title: "Â¿QuiÃ©n lidera actualmente el emprendimiento?",
    options: [
      { value: "titular", label: "Yo soy el/la titular o responsable principal" },
      { value: "socios", label: "Lo lideramos entre socios/as" },
      { value: "familia", label: "Es un emprendimiento familiar" },
      { value: "equipo", label: "Existe un equipo responsable" },
    ],
  },
  {
    id: "etapa",
    section: "Tu emprendimiento",
    title: "Â¿En quÃ© etapa estÃ¡ hoy tu emprendimiento?",
    options: [
      { value: "idea", label: "Tengo una idea y quiero saber si es viable" },
      { value: "preparacion", label: "Estoy preparando todo para comenzar" },
      { value: "inicio", label: "Ya comencÃ©, pero vendo ocasionalmente" },
      { value: "ventas", label: "Tengo ventas habituales" },
      { value: "crecimiento", label: "Estoy creciendo y necesito ordenar el negocio" },
      { value: "consolidado", label: "Tengo un negocio consolidado y quiero seguir creciendo" },
      { value: "dificultad", label: "Mi negocio estÃ¡ pasando por dificultades" },
    ],
  },
  {
    id: "objetivo",
    section: "Tu emprendimiento",
    title: "Â¿CuÃ¡l es hoy tu principal objetivo?",
    options: [
      { value: "comenzar", label: "Saber cÃ³mo comenzar correctamente" },
      { value: "formalizar", label: "Formalizarme y ordenar permisos" },
      { value: "vender", label: "Conseguir clientes o vender mÃ¡s" },
      { value: "rentabilidad", label: "Mejorar precios, costos y rentabilidad" },
      { value: "ordenar", label: "Ordenar la gestiÃ³n del negocio" },
      { value: "financiar", label: "Conseguir financiamiento o invertir" },
      { value: "crecer", label: "Crecer, contratar o llegar a nuevos mercados" },
      { value: "recuperar", label: "Recuperar un negocio que ha bajado" },
      { value: "general", label: "Conocer mi situaciÃ³n general" },
    ],
  },
  {
    id: "sector",
    section: "Tu emprendimiento",
    title: "Â¿CuÃ¡l describe mejor tu actividad principal?",
    options: sectors.map(([value, label]) => ({ value, label })),
  },
  {
    id: "lugar",
    section: "Tu emprendimiento",
    title: "Â¿DÃ³nde desarrollas principalmente la actividad?",
    options: [
      { value: "casa", label: "En mi casa" },
      { value: "local", label: "En un local comercial" },
      { value: "taller", label: "En un taller" },
      { value: "feria", label: "En una feria" },
      { value: "via", label: "En la vÃ­a pÃºblica" },
      { value: "terreno", label: "En terreno agrÃ­cola o rural" },
      { value: "mar", label: "En mar, rÃ­o, lago o caleta" },
      { value: "vehiculo", label: "En un vehÃ­culo" },
      { value: "cliente", label: "En instalaciones del cliente" },
      { value: "internet", label: "Principalmente por internet" },
      { value: "varios", label: "En varios de los anteriores" },
    ],
  },
  {
    id: "territorio",
    section: "Tu emprendimiento",
    title: "Â¿DÃ³nde desarrollas principalmente tu actividad?",
    options: [
      { value: "linares", label: "Linares" },
      { value: "longavi", label: "LongavÃ­" },
      { value: "parral", label: "Parral" },
      { value: "retiro", label: "Retiro" },
      { value: "sanjavier", label: "San Javier" },
      { value: "villaalegre", label: "Villa Alegre" },
      { value: "yerbasbuenas", label: "Yerbas Buenas" },
      { value: "colbun", label: "ColbÃºn" },
      { value: "cauquenes", label: "Cauquenes" },
      { value: "chanco", label: "Chanco" },
      { value: "pelluhue", label: "Pelluhue" },
      { value: "otra", label: "Otra comuna / territorio" },
    ],
  },
  {
    id: "estructura",
    section: "FormalizaciÃ³n",
    dimension: "FormalizaciÃ³n",
    title: "Â¿CÃ³mo funciona legalmente hoy tu actividad?",
    options: [
      { value: "empresa", label: "Empresa o sociedad con RUT propio", score: 4, severity: "ok" },
      { value: "natural", label: "Persona natural con inicio de actividades", score: 4, severity: "ok" },
      { value: "preparando", label: "AÃºn no comienzo y estoy definiendo cÃ³mo formalizarme", score: 2, severity: "warning", action: "Definir la forma de formalizaciÃ³n antes de iniciar operaciones." },
      { value: "informal", label: "Ya vendo o presto servicios sin formalizaciÃ³n", score: 0, severity: "critical", action: "Revisar la forma adecuada de formalizaciÃ³n antes de expandir la actividad.", organism: "SII / Registro de Empresas y Sociedades" },
      { value: "nose", label: "No sÃ© quÃ© estructura necesito", score: 1, severity: "warning", action: "Evaluar la estructura jurÃ­dica y tributaria adecuada para la actividad." },
    ],
  },
  {
    id: "sii",
    section: "FormalizaciÃ³n",
    dimension: "Tributario",
    title: "Â¿Tienes Inicio de Actividades vigente ante el SII?",
    options: [
      { value: "si", label: "SÃ­", score: 4, severity: "ok" },
      { value: "tramite", label: "EstÃ¡ en trÃ¡mite", score: 2, severity: "warning", action: "Completar y verificar el Inicio de Actividades.", organism: "SII" },
      { value: "no", label: "No", score: 0, severity: "critical", action: "Revisar y regularizar el Inicio de Actividades antes de mantener ventas habituales.", organism: "SII" },
      { value: "nose", label: "No sÃ© si me corresponde", score: 1, severity: "warning", action: "Revisar la obligaciÃ³n segÃºn la actividad econÃ³mica.", organism: "SII" },
      { value: "aun", label: "TodavÃ­a no comienzo", score: 2, severity: "info" },
    ],
  },
  {
    id: "documentos",
    section: "FormalizaciÃ³n",
    dimension: "Tributario",
    title: "Â¿Emites los documentos tributarios que corresponden a tus ventas o servicios?",
    when: canAskOperationalCompliance,
    options: [
      { value: "si", label: "SÃ­, siempre", score: 4, severity: "ok" },
      { value: "casi", label: "Casi siempre", score: 3, severity: "warning", action: "Revisar que todas las operaciones queden correctamente documentadas.", organism: "SII" },
      { value: "solicitan", label: "SÃ³lo cuando me lo solicitan", score: 1, severity: "warning", action: "Revisar la obligaciÃ³n de emisiÃ³n de documentos tributarios.", organism: "SII" },
      { value: "no", label: "No", score: 0, severity: "critical", action: "Regularizar la emisiÃ³n de documentos tributarios.", organism: "SII" },
      { value: "nose", label: "No sÃ© quÃ© documento debo emitir", score: 1, severity: "warning", action: "Determinar el documento tributario aplicable.", organism: "SII" },
      { value: "novendo", label: "TodavÃ­a no vendo", score: 2, severity: "info" },
    ],
  },
  {
    id: "patente_previa",
    section: "FormalizaciÃ³n",
    dimension: "Municipal y permisos",
    title: "Antes de formalizarte, Â¿has revisado quÃ© patente o permiso municipal podrÃ­a necesitar tu actividad?",
    when: isPreFormal,
    options: [
      { value: "si", label: "SÃ­, ya sÃ© quÃ© podrÃ­a necesitar", score: 3, severity: "ok" },
      { value: "parcial", label: "Tengo una idea, pero debo confirmarlo", score: 2, severity: "warning", action: "Confirmar requisitos municipales antes de invertir o habilitar un lugar.", organism: "Municipalidad" },
      { value: "no", label: "No lo he revisado", score: 1, severity: "warning", action: "Consultar anticipadamente patente, permiso y condiciones del lugar antes de invertir.", organism: "Municipalidad" },
      { value: "nose", label: "No sÃ© por dÃ³nde partir", score: 1, severity: "warning", action: "Solicitar orientaciÃ³n municipal sobre patente, permiso y uso del lugar.", organism: "Municipalidad" },
    ],
  },
  {
    id: "patente",
    section: "FormalizaciÃ³n",
    dimension: "Municipal y permisos",
    title: "Â¿Has revisado si tu actividad requiere patente o permiso municipal?",
    when: canAskOperationalCompliance,
    options: [
      { value: "vigente", label: "SÃ­, y lo tengo vigente", score: 4, severity: "ok" },
      { value: "tramite", label: "SÃ­, estÃ¡ en trÃ¡mite", score: 2, severity: "warning", action: "Completar la tramitaciÃ³n municipal.", organism: "Municipalidad" },
      { value: "pendiente", label: "SÃ© que lo necesito, pero aÃºn no lo tramito", score: 0, severity: "critical", action: "Tramitar la patente o permiso aplicable antes de ampliar la actividad.", organism: "Municipalidad" },
      { value: "noaplica", label: "Ya revisÃ© y no aplica", score: 4, severity: "ok" },
      { value: "nose", label: "No sÃ© si corresponde", score: 1, severity: "warning", action: "Consultar si la forma y lugar de operaciÃ³n requieren patente o permiso.", organism: "Municipalidad" },
    ],
  },
  {
    id: "inmueble",
    section: "FormalizaciÃ³n",
    dimension: "Municipal y permisos",
    title: "Â¿El lugar donde funciona o funcionarÃ¡ tu negocio estÃ¡ habilitado para esa actividad?",
    when: (a) => hasPremises(a) && hasFormalTaxStart(a),
    options: yesNo("Verificar uso, recepciÃ³n y condiciones del inmueble antes de nuevas inversiones.", "Municipalidad / DOM"),
  },
  {
    id: "inmueble_previo",
    section: "FormalizaciÃ³n",
    dimension: "Municipal y permisos",
    title: "Antes de invertir en el lugar, Â¿has validado si ese inmueble o terreno puede usarse para tu actividad?",
    when: (a) => hasPremises(a) && isPreFormal(a),
    options: [
      { value: "si", label: "SÃ­, ya lo revisÃ©", score: 3, severity: "ok" },
      { value: "parcial", label: "Lo estoy revisando", score: 2, severity: "warning", action: "Completar la validaciÃ³n del lugar antes de realizar inversiones importantes.", organism: "Municipalidad / DOM" },
      { value: "no", label: "No lo he revisado", score: 0, severity: "critical", action: "Validar uso, recepciÃ³n y condiciones del inmueble antes de invertir.", organism: "Municipalidad / DOM" },
      { value: "nose", label: "No sÃ© si debo revisarlo", score: 1, severity: "warning", action: "Consultar si el lugar es compatible con la actividad antes de habilitarlo.", organism: "Municipalidad / DOM" },
    ],
  },
  {
    id: "alimentos",
    section: "FormalizaciÃ³n",
    title: "Â¿Tu actividad produce, manipula, almacena o vende alimentos?",
    options: [
      { value: "elabora", label: "SÃ­, elaboro o manipulo alimentos" },
      { value: "almacena", label: "SÃ­, almaceno o distribuyo alimentos" },
      { value: "envasados", label: "SÃ³lo comercializo productos envasados" },
      { value: "no", label: "No trabajo con alimentos" },
    ],
  },
  {
    id: "sanitaria_previa",
    section: "FormalizaciÃ³n",
    dimension: "Municipal y permisos",
    title: "Â¿Has revisado quÃ© autorizaciÃ³n sanitaria podrÃ­a requerir tu actividad con alimentos?",
    when: (a) => foodActivity(a) && isPreFormal(a),
    options: [
      { value: "si", label: "SÃ­, ya conozco el requisito", score: 3, severity: "ok" },
      { value: "parcial", label: "Tengo informaciÃ³n, pero debo confirmarla", score: 2, severity: "warning", action: "Confirmar requisitos sanitarios antes de habilitar o comprar equipamiento.", organism: "SEREMI de Salud" },
      { value: "no", label: "No lo he revisado", score: 0, severity: "critical", action: "Revisar requisitos sanitarios antes de invertir en infraestructura o comenzar elaboraciÃ³n.", organism: "SEREMI de Salud" },
      { value: "nose", label: "No sÃ© si necesito autorizaciÃ³n", score: 1, severity: "warning", action: "Consultar a la autoridad sanitaria antes de habilitar el negocio.", organism: "SEREMI de Salud" },
    ],
  },
  {
    id: "sanitaria",
    section: "FormalizaciÃ³n",
    dimension: "Municipal y permisos",
    title: "Â¿Tienes la autorizaciÃ³n sanitaria que corresponde a tu actividad?",
    when: (a) => foodActivity(a) && hasFormalTaxStart(a),
    options: yesNo("Revisar y tramitar la autorizaciÃ³n sanitaria antes de operar o expandir.", "SEREMI de Salud"),
  },
  {
    id: "separacion",
    section: "NÃºmeros del negocio",
    dimension: "Finanzas",
    title: "Â¿El dinero del negocio se maneja separado de tus gastos personales?",
    options: yesNo("Separar las finanzas personales de las del negocio como prioridad de gestiÃ³n."),
  },
  {
    id: "costos",
    section: "NÃºmeros del negocio",
    dimension: "Finanzas",
    title: "Â¿Conoces cuÃ¡nto te cuesta realmente producir o entregar lo que vendes?",
    options: yesNo("Calcular costos directos e indirectos antes de decidir precios o crecimiento."),
  },
  {
    id: "precios",
    section: "NÃºmeros del negocio",
    dimension: "Finanzas",
    title: "Â¿CÃ³mo defines tus precios?",
    options: [
      { value: "completo", label: "Considero costos, gastos, impuestos, margen y mercado", score: 4, severity: "ok" },
      { value: "margen", label: "Principalmente costos + margen", score: 3, severity: "ok" },
      { value: "competencia", label: "Me guÃ­o principalmente por la competencia", score: 2, severity: "warning", action: "Comprobar que el precio cubra todos los costos y deje margen." },
      { value: "intuicion", label: "Defino un precio que me parece adecuado", score: 1, severity: "warning", action: "Construir una metodologÃ­a simple de fijaciÃ³n de precios." },
      { value: "sin", label: "AÃºn no he definido precios", score: 1, severity: "warning", action: "Definir precios sÃ³lo despuÃ©s de validar costos, cliente y mercado." },
    ],
  },
  {
    id: "margen",
    section: "NÃºmeros del negocio",
    dimension: "Finanzas",
    title: "Â¿Sabes cuÃ¡nto ganas realmente por cada producto o servicio vendido?",
    options: yesNo("Calcular margen real por producto o servicio antes de aumentar ventas."),
  },
  {
    id: "equilibrio",
    section: "NÃºmeros del negocio",
    dimension: "Finanzas",
    title: "Â¿Sabes cuÃ¡nto debes vender para cubrir todos tus costos?",
    options: yesNo("Calcular el punto de equilibrio y la caja mÃ­nima mensual."),
  },
  {
    id: "cliente",
    section: "Clientes y ventas",
    dimension: "Mercado y ventas",
    title: "Â¿Tienes claramente identificado quiÃ©n es tu cliente principal?",
    options: yesNo("Definir el segmento de cliente prioritario y su necesidad principal."),
  },
  {
    id: "demanda",
    section: "Clientes y ventas",
    dimension: "Mercado y ventas",
    title: "Â¿Has comprobado que existen personas dispuestas a pagar por lo que ofreces?",
    options: [
      { value: "recurrente", label: "SÃ­, tengo clientes recurrentes", score: 4, severity: "ok" },
      { value: "ventas", label: "SÃ­, ya he realizado varias ventas", score: 3, severity: "ok" },
      { value: "pruebas", label: "He realizado algunas ventas o pruebas", score: 2, severity: "warning", action: "Seguir validando demanda, recurrencia y precio." },
      { value: "interes", label: "Hay interÃ©s, pero aÃºn no ventas", score: 1, severity: "warning", action: "Validar disposiciÃ³n a pagar antes de realizar inversiones importantes." },
      { value: "no", label: "TodavÃ­a no lo he validado", score: 0, severity: "critical", action: "Validar demanda y precio antes de comprometer inversiÃ³n relevante." },
    ],
  },
  {
    id: "seguimiento",
    section: "Clientes y ventas",
    dimension: "Mercado y ventas",
    title: "Â¿Registras y haces seguimiento a personas interesadas y clientes?",
    options: yesNo("Implementar un sistema bÃ¡sico de seguimiento comercial."),
  },
  {
    id: "procesos",
    section: "OperaciÃ³n",
    dimension: "OperaciÃ³n",
    title: "Â¿Tienes una forma ordenada y repetible de trabajar?",
    options: yesNo("Documentar los procesos crÃ­ticos antes de crecer."),
  },
  {
    id: "capacidad",
    section: "OperaciÃ³n",
    dimension: "OperaciÃ³n",
    title: "Si maÃ±ana duplicaras tus ventas, Â¿podrÃ­as responder sin perder calidad?",
    options: yesNo("Identificar cuellos de botella y capacidad mÃ¡xima antes de acelerar ventas."),
  },
  {
    id: "personas",
    section: "Personas",
    title: "Â¿QuiÃ©nes trabajan regularmente en el negocio?",
    options: [
      { value: "solo", label: "Trabajo solo" },
      { value: "familia", label: "Trabajo con familiares" },
      { value: "socios", label: "Trabajo con socios" },
      { value: "contratados", label: "Tengo trabajadores contratados" },
      { value: "externos", label: "Trabajo con prestadores o colaboradores externos" },
      { value: "aun", label: "TodavÃ­a no comienzo" },
    ],
  },
  {
    id: "laboral",
    section: "Personas",
    dimension: "Personas",
    title: "Â¿Las personas que trabajan contigo tienen su relaciÃ³n contractual correctamente definida?",
    when: (a) => hasWorkers(a) && hasFormalTaxStart(a),
    options: yesNo("Revisar contratos, cotizaciones y obligaciones laborales o de prestaciÃ³n de servicios.", "DirecciÃ³n del Trabajo"),
  },
  {
    id: "laboral_previo",
    section: "Personas",
    dimension: "Personas",
    title: "Cuando formalices la actividad, Â¿has definido cÃ³mo se vincularÃ¡n las personas que trabajan contigo?",
    when: (a) => hasWorkers(a) && isPreFormal(a),
    options: [
      { value: "si", label: "SÃ­, ya lo tengo definido", score: 3, severity: "ok" },
      { value: "parcial", label: "Tengo una idea, pero debo revisarla", score: 2, severity: "warning", action: "Definir correctamente si corresponde relaciÃ³n laboral, societaria o prestaciÃ³n de servicios.", organism: "DirecciÃ³n del Trabajo / asesorÃ­a laboral" },
      { value: "no", label: "No lo he definido", score: 1, severity: "warning", action: "Revisar la forma correcta de vinculaciÃ³n antes de comenzar operaciones regulares.", organism: "DirecciÃ³n del Trabajo / asesorÃ­a laboral" },
      { value: "nose", label: "No sÃ© quÃ© corresponde", score: 1, severity: "warning", action: "Solicitar orientaciÃ³n laboral antes de contratar o pagar remuneraciones.", organism: "DirecciÃ³n del Trabajo / asesorÃ­a laboral" },
    ],
  },
  {
    id: "digital",
    section: "DigitalizaciÃ³n",
    dimension: "Digital",
    title: "Â¿QuÃ© tan fÃ¡cil es para un cliente encontrarte y contactarte por internet?",
    options: [
      { value: "facil", label: "Muy fÃ¡cil, tengo canales actualizados", score: 4, severity: "ok" },
      { value: "redes", label: "Principalmente por redes sociales", score: 3, severity: "ok" },
      { value: "whatsapp", label: "Principalmente por WhatsApp", score: 2, severity: "warning", action: "Ordenar la presencia digital y facilitar contacto, ubicaciÃ³n y oferta." },
      { value: "desactualizado", label: "Mi informaciÃ³n estÃ¡ desactualizada", score: 1, severity: "warning", action: "Actualizar informaciÃ³n y canales digitales." },
      { value: "nada", label: "No tengo presencia digital", score: 0, severity: "warning", action: "Evaluar un canal digital bÃ¡sico acorde al cliente." },
      { value: "noaplica", label: "No es relevante para mi actividad", score: 4, severity: "ok" },
    ],
  },
  {
    id: "dependencia",
    section: "Riesgos",
    dimension: "Riesgos",
    title: "Â¿QuÃ© pasarÃ­a si tÃº no pudieras trabajar durante un mes?",
    options: [
      { value: "normal", label: "El negocio seguirÃ­a funcionando normalmente", score: 4, severity: "ok" },
      { value: "parcial", label: "FuncionarÃ­a parcialmente", score: 3, severity: "ok" },
      { value: "dificil", label: "TendrÃ­a dificultades importantes", score: 1, severity: "warning", action: "Reducir dependencia del dueÃ±o mediante procesos, respaldo y delegaciÃ³n." },
      { value: "detiene", label: "PrÃ¡cticamente se detendrÃ­a", score: 0, severity: "critical", action: "Crear continuidad operacional y reducir dependencia crÃ­tica del dueÃ±o." },
    ],
  },
  {
    id: "estacionalidad",
    section: "Riesgos",
    dimension: "Riesgos",
    title: "Â¿Tus ingresos dependen fuertemente de temporadas o fechas especÃ­ficas?",
    options: [
      { value: "alta", label: "SÃ­, gran parte del ingreso se concentra en una temporada", score: 1, severity: "warning", action: "Preparar caja y oferta complementaria para perÃ­odos de baja demanda." },
      { value: "media", label: "SÃ­, pero tengo actividad el resto del aÃ±o", score: 2, severity: "warning", action: "Planificar caja y acciones comerciales segÃºn temporada." },
      { value: "baja", label: "Hay variaciones, pero son manejables", score: 3, severity: "ok" },
      { value: "estable", label: "La actividad es relativamente estable todo el aÃ±o", score: 4, severity: "ok" },
      { value: "nose", label: "TodavÃ­a no lo sÃ©", score: 1, severity: "warning", action: "Medir ventas por mes para conocer la estacionalidad real." },
    ],
  },
  {
    id: "capital",
    section: "Crecimiento",
    dimension: "Crecimiento",
    title: "Â¿Sabes cuÃ¡nto capital necesitas para tu siguiente etapa?",
    options: yesNo("Preparar presupuesto, flujo y destino de los recursos antes de buscar financiamiento."),
  },
  {
    id: "meta",
    section: "Crecimiento",
    dimension: "Crecimiento",
    title: "Â¿Tienes definido dÃ³nde quieres que estÃ© el negocio en 12 meses?",
    options: yesNo("Definir dos o tres metas concretas y medibles para los prÃ³ximos 12 meses."),
  },

  // AGRICULTURA
  {
    id: "agri_agua",
    section: "Actividad especÃ­fica",
    dimension: "Sectorial",
    title: "Â¿Tienes acceso suficiente y confiable al agua necesaria para el proyecto?",
    when: sectorIs("agricultura"),
    options: yesNo("Validar disponibilidad y continuidad de agua antes de ampliar superficie o inversiÃ³n."),
  },
  {
    id: "agri_suelo",
    section: "Actividad especÃ­fica",
    dimension: "Sectorial",
    title: "Â¿Has evaluado suelo y condiciones agroclimÃ¡ticas para lo que quieres producir?",
    when: sectorIs("agricultura"),
    options: yesNo("Validar tÃ©cnicamente suelo y condiciones productivas antes de plantar o invertir."),
  },
  {
    id: "agri_mercado",
    section: "Actividad especÃ­fica",
    dimension: "Mercado y ventas",
    title: "Antes de producir, Â¿tienes definido quiÃ©n podrÃ­a comprar tu producciÃ³n?",
    when: sectorIs("agricultura"),
    options: yesNo("Validar comprador, canal, volumen y precio antes de comprometer inversiÃ³n productiva."),
  },

  // PESCA
  {
    id: "pesca_rpa",
    section: "Actividad especÃ­fica",
    dimension: "Sectorial",
    title: "Â¿Tu actividad estÃ¡ inscrita en el Registro Pesquero Artesanal cuando corresponde?",
    when: sectorIs("pesca"),
    options: yesNo("Revisar inscripciÃ³n y categorÃ­a aplicable antes de operar.", "Sernapesca"),
  },
  {
    id: "pesca_costos",
    section: "Actividad especÃ­fica",
    dimension: "Finanzas",
    title: "Â¿Conoces el costo real de una jornada considerando combustible, hielo, mantenciÃ³n, tripulaciÃ³n y otros gastos?",
    when: sectorIs("pesca"),
    options: yesNo("Calcular costo por jornada y margen real por recurso vendido."),
  },

  // FERIA / COMERCIO
  {
    id: "feria_permiso",
    section: "Actividad especÃ­fica",
    dimension: "Municipal y permisos",
    title: "Â¿Tienes permiso para vender en el lugar o feria donde trabajas?",
    when: sectorIs("feria"),
    options: yesNo("Regularizar el permiso correspondiente antes de ampliar la actividad.", "Municipalidad"),
  },
  {
    id: "comercio_resultado",
    section: "Actividad especÃ­fica",
    dimension: "Finanzas",
    title: "Al terminar una jornada o perÃ­odo, Â¿sabes cuÃ¡nto ganaste despuÃ©s de mercaderÃ­a y otros costos?",
    when: sectorIs("feria", "comercio"),
    options: yesNo("Separar ventas de utilidad e implementar un control simple de resultado."),
  },

  // GASTRONOMÃA
  {
    id: "gastro_costeo",
    section: "Actividad especÃ­fica",
    dimension: "Finanzas",
    title: "Â¿Conoces el costo actualizado de cada plato o producto principal?",
    when: sectorIs("gastronomia"),
    options: yesNo("Costear recetas y productos antes de ajustar precios o promociones."),
  },
  {
    id: "gastro_merma",
    section: "Actividad especÃ­fica",
    dimension: "OperaciÃ³n",
    title: "Â¿Controlas mermas y pÃ©rdidas de alimentos?",
    when: sectorIs("gastronomia"),
    options: yesNo("Implementar control de mermas por producto y causa."),
  },

  // ARTESANÃA / MANUFACTURA
  {
    id: "art_horas",
    section: "Actividad especÃ­fica",
    dimension: "Finanzas",
    title: "Â¿Sabes cuÃ¡ntas horas reales toma fabricar cada producto y las incluyes en el precio?",
    when: sectorIs("artesania", "manufactura"),
    options: yesNo("Medir horas de producciÃ³n e incorporar la mano de obra real al costo."),
  },

  // TRANSPORTE
  {
    id: "carga_costo",
    section: "Actividad especÃ­fica",
    dimension: "Finanzas",
    title: "Â¿Sabes cuÃ¡nto te cuesta realmente cada viaje o kilÃ³metro?",
    when: sectorIs("carga"),
    options: yesNo("Calcular costo por kilÃ³metro incluyendo combustible, peajes, neumÃ¡ticos, mantenciÃ³n, depreciaciÃ³n y tiempo."),
  },
  {
    id: "pasajeros_meta",
    section: "Actividad especÃ­fica",
    dimension: "Finanzas",
    title: "Â¿Sabes cuÃ¡nto debes facturar diariamente para cubrir vehÃ­culo, combustible, mantenciÃ³n y tu ingreso esperado?",
    when: sectorIs("pasajeros"),
    options: yesNo("Definir una meta diaria mÃ­nima de facturaciÃ³n basada en el costo total."),
  },
  {
    id: "transporte_permisos",
    section: "Actividad especÃ­fica",
    dimension: "Sectorial",
    title: "Â¿Tu vehÃ­culo y servicio cuentan con la documentaciÃ³n y permisos vigentes para el tipo de transporte realizado?",
    when: sectorIs("pasajeros", "carga"),
    options: yesNo("Regularizar documentaciÃ³n y permisos aplicables antes de continuar o ampliar la operaciÃ³n.", "Ministerio de Transportes / organismo competente"),
  },

  // CONSTRUCCIÃ“N
  {
    id: "construccion_regulado",
    section: "Actividad especÃ­fica",
    dimension: "Sectorial",
    title: "Â¿Has revisado si los trabajos que realizas requieren instalador autorizado, certificaciÃ³n o habilitaciÃ³n especÃ­fica?",
    when: sectorIs("construccion"),
    options: yesNo("Validar si los trabajos ofrecidos requieren habilitaciÃ³n o certificaciÃ³n sectorial.", "Organismo sectorial competente"),
  },

  // TURISMO
  {
    id: "turismo_registro",
    section: "Actividad especÃ­fica",
    dimension: "Sectorial",
    title: "Â¿Has revisado si tu servicio debe estar inscrito en el Registro de Prestadores de Servicios TurÃ­sticos?",
    when: sectorIs("turismo"),
    options: yesNo("Revisar y regularizar la inscripciÃ³n aplicable.", "Sernatur"),
  },

  // SERVICIOS
  {
    id: "serv_tarifa",
    section: "Actividad especÃ­fica",
    dimension: "Finanzas",
    title: "Â¿Tu tarifa considera tiempo, costos, traslados, impuestos y margen?",
    when: sectorIs("profesional", "personal", "belleza", "educacion", "tecnologia"),
    options: yesNo("Calcular una tarifa mÃ­nima rentable por hora o servicio."),
  },

  // MÃšSICA
  {
    id: "musica_precio",
    section: "Actividad especÃ­fica",
    dimension: "Finanzas",
    title: "Â¿El precio por presentaciÃ³n considera mÃºsicos, traslado, sonido, montaje y tiempo total?",
    when: sectorIs("musica"),
    options: yesNo("Construir el costo mÃ­nimo por presentaciÃ³n antes de cotizar."),
  },
];

function visibleQuestions(a: AnswerMap) {
  return questions.filter((q) => !q.when || q.when(a));
}


type BoundEntrepreneur = {
  id: string;
  business_name: string;
  owner_name: string | null;
  slug: string;
  comunas?: { name?: string | null } | null;
  categories?: { name?: string | null } | null;
};

function DiagnosticoPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<"intro" | "questions" | "report">("intro");
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [index, setIndex] = useState(0);
  const [hasSaved, setHasSaved] = useState(false);
  const [entrepreneurs, setEntrepreneurs] = useState<BoundEntrepreneur[]>([]);
  const [selectedEntrepreneurId, setSelectedEntrepreneurId] = useState("");
  const [savedDiagnosticId, setSavedDiagnosticId] = useState<string | null>(null);
  const [savingDiagnostic, setSavingDiagnostic] = useState(false);
  const [entrepreneursLoaded, setEntrepreneursLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadEntrepreneurs() {
      if (!user?.id) {
        if (active) {
          setEntrepreneurs([]);
          setSelectedEntrepreneurId("");
          setEntrepreneursLoaded(true);
        }
        return;
      }

      const { data, error } = await (supabase as any)
        .from("entrepreneurs")
        .select("id,business_name,owner_name,slug,comunas:comuna_id(name),categories:category_id(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error) {
        console.error("No fue posible cargar emprendimientos:", error.message);
        if (active) {
          setEntrepreneursLoaded(true);
        }
        return;
      }

      const rows = (data ?? []) as BoundEntrepreneur[];
      setEntrepreneurs(rows);

      if (rows.length === 1) {
        setSelectedEntrepreneurId(rows[0].id);
      }

      setEntrepreneursLoaded(true);
    }

    loadEntrepreneurs();

    return () => {
      active = false;
    };
  }, [user?.id]);

  useEffect(() => {
    try {
      setHasSaved(Boolean(localStorage.getItem(STORAGE_KEY)));
    } catch {
      setHasSaved(false);
    }
  }, []);

  useEffect(() => {
    if (mode !== "questions") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, index }));
      setHasSaved(true);
    } catch {}
  }, [answers, index, mode]);

  const visible = useMemo(() => visibleQuestions(answers), [answers]);
  const current = visible[Math.min(index, Math.max(visible.length - 1, 0))];
  const report = useMemo(() => buildReport(answers), [answers]);

  function start() {
    const selected = entrepreneurs.find((item) => item.id === selectedEntrepreneurId);

    const initialAnswers: AnswerMap = selected
      ? {
          _profile_bound: "yes",
          nombre_emprendimiento: selected.business_name,
          nombre_emprendedor: selected.owner_name ?? "Titular / responsable principal",
          comuna: selected.comunas?.name ?? "",
        }
      : {};

    setAnswers(initialAnswers);
    setIndex(0);
    setSavedDiagnosticId(null);
    setMode("questions");

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  function resume() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return start();
      const parsed = JSON.parse(raw);
      setAnswers(parsed.answers ?? {});
      setIndex(Number(parsed.index ?? 0));
      setMode("questions");
    } catch {
      start();
    }
  }

  async function next() {
    if (!current || !answers[current.id]) return;

    const now = visibleQuestions(answers);

    if (index >= now.length - 1) {
      const finalReport = buildReport(answers);

      if (user?.id && selectedEntrepreneurId && !savingDiagnostic) {
        setSavingDiagnostic(true);

        const { data, error } = await (supabase as any)
          .from("entrepreneur_diagnostics")
          .insert({
            entrepreneur_id: selectedEntrepreneurId,
            user_id: user.id,
            score: finalReport.overall,
            sector: answers.sector ?? null,
            stage: answers.etapa ?? null,
            answers,
            report: finalReport,
          })
          .select("id")
          .single();

        setSavingDiagnostic(false);

        if (error) {
          console.error("No fue posible guardar el diagnÃ³stico:", error.message);
        } else {
          setSavedDiagnosticId(data.id);
        }
      }

      setMode("report");
      setHasSaved(false);

      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}

      return;
    }

    setIndex((v) => v + 1);
  }

  function back() {
    if (index > 0) setIndex((v) => v - 1);
    else setMode("intro");
  }

  if (!user?.id) {
    return (
      <section className="container-page py-10">
        <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center">
          <p className="eyebrow">DIAGNÓSTICO DEL EMPRENDEDOR</p>
          <h1 className="mt-2 font-display text-2xl font-semibold">
            Ingresa para realizar tu diagnóstico
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta herramienta está disponible para emprendedores registrados en La Vitrina.
          </p>
          <Button asChild className="mt-5">
            <Link to="/auth">Ingresar</Link>
          </Button>
        </div>
      </section>
    );
  }

  if (!entrepreneursLoaded) {
    return (
      <section className="container-page py-10">
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
      </section>
    );
  }

  if (entrepreneurs.length === 0) {
    return (
      <section className="container-page py-10">
        <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center">
          <p className="eyebrow">DIAGNÓSTICO DEL EMPRENDEDOR</p>
          <h1 className="mt-2 font-display text-2xl font-semibold">
            Primero registra tu emprendimiento
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            El diagnóstico se guarda en la ficha de tu emprendimiento.
          </p>
          <Button asChild className="mt-5">
            <Link to="/sumate">Registrar emprendimiento</Link>
          </Button>
        </div>
      </section>
    );
  }

  if (mode === "intro") {
    return (
      <DiagnosticIntro
        onStart={start}
        hasSaved={hasSaved}
        onResume={resume}
        entrepreneurs={entrepreneurs}
        selectedEntrepreneurId={selectedEntrepreneurId}
        onSelectEntrepreneur={setSelectedEntrepreneurId}
        isLoggedIn={Boolean(user?.id)}
      />
    );
  }

  if (mode === "questions" && current) {
    return (
      <QuestionView
        question={current}
        value={answers[current.id]}
        index={index}
        total={visible.length}
        onSelect={(value) =>
          setAnswers((prev) => ({ ...prev, [current.id]: value }))
        }
        onBack={back}
        onNext={next}
      />
    );
  }

  return (
    <ReportView
      report={report}
      answers={answers}
      onRestart={start}
      savedDiagnosticId={savedDiagnosticId}
    />
  );
}

function DiagnosticIntro({
  onStart,
  hasSaved,
  onResume,
  entrepreneurs,
  selectedEntrepreneurId,
  onSelectEntrepreneur,
  isLoggedIn,
}: {
  onStart: () => void;
  hasSaved: boolean;
  onResume: () => void;
  entrepreneurs: BoundEntrepreneur[];
  selectedEntrepreneurId: string;
  onSelectEntrepreneur: (id: string) => void;
  isLoggedIn: boolean;
}) {
  return (
    <>
      <section className="border-b border-border bg-surface">
        <div className="container-page py-7 sm:py-8">
          <p className="eyebrow">EVALUACIÃ“N INTEGRAL</p>
          <h1 className="mt-1 page-title">DiagnÃ³stico del Emprendedor</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Conoce el estado real de tu emprendimiento, identifica brechas y fortalezas,
            y descubre quÃ© deberÃ­as priorizar para avanzar.
          </p>
        </div>
      </section>

      <section className="container-page py-7 sm:py-8">
        <div className="grid gap-3 sm:grid-cols-3">
          <IntroCard
            icon={<Clock3 className="h-4 w-4" />}
            title="12â€“18 minutos"
            text="Las preguntas se adaptan a tu actividad y etapa."
          />
          <IntroCard
            icon={<BarChart3 className="h-4 w-4" />}
            title="EvaluaciÃ³n personalizada"
            text="Un agricultor, feriante o transportista no recorre el mismo diagnÃ³stico."
          />
          <IntroCard
            icon={<RouteIcon className="h-4 w-4" />}
            title="Plan concreto"
            text="RecibirÃ¡s prioridades y una hoja de ruta para 30 y 90 dÃ­as."
          />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="eyebrow">QUÃ‰ EVALUAREMOS</p>
                <h2 className="mt-1 section-title">Una mirada completa de tu negocio</h2>
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                "FormalizaciÃ³n, SII y tributaciÃ³n",
                "Patentes, permisos y habilitaciÃ³n",
                "Costos, precios y rentabilidad",
                "Clientes, mercado y ventas",
                "OperaciÃ³n, personas y capacidad",
                "DigitalizaciÃ³n y continuidad",
                "InversiÃ³n y crecimiento",
                "Exigencias segÃºn tu actividad",
              ].map((item) => (
                <div
                  key={item}
                  className="flex gap-2 rounded-lg bg-secondary/15 px-3 py-2.5"
                >
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="text-[11px] leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-border bg-secondary/15 p-5">
            <p className="eyebrow">AL FINALIZAR</p>
            <h2 className="mt-1 section-title">RecibirÃ¡s un reporte accionable</h2>
            <div className="mt-4 space-y-2.5 text-xs leading-relaxed">
              <p>âœ“ Fortalezas y cumplimientos destacados.</p>
              <p>âœ“ Brechas y riesgos que requieren atenciÃ³n.</p>
              <p>âœ“ Oportunidades de mejora y crecimiento.</p>
              <p>âœ“ Prioridades ordenadas por impacto y urgencia.</p>
              <p>âœ“ Plan concreto para los prÃ³ximos 30 y 90 dÃ­as.</p>
            </div>
            <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
              No necesitas conocimientos tÃ©cnicos. Responde segÃºn tu situaciÃ³n real.
              Las materias regulatorias que correspondan deberÃ¡n validarse ante el organismo competente.
            </p>
          </article>
        </div>

        <div className="mt-5 rounded-xl border border-border bg-card p-5">
          <p className="eyebrow">IDENTIFICACIÃ“N</p>
          <h2 className="mt-1 section-title">Ficha del emprendimiento</h2>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Al comenzar te pediremos los datos bÃ¡sicos para personalizar e identificar tu informe.
          </p>
        </div>

        {isLoggedIn ? (
          <div className="mt-5 rounded-xl border border-border bg-card p-5">
            <p className="eyebrow">EMPRENDIMIENTO A DIAGNOSTICAR</p>

            {entrepreneurs.length > 0 ? (
              <>
                <p className="mt-1 text-xs text-muted-foreground">
                  El diagnÃ³stico quedarÃ¡ guardado en la ficha del emprendimiento seleccionado.
                </p>

                <select
                  value={selectedEntrepreneurId}
                  onChange={(event) => onSelectEntrepreneur(event.target.value)}
                  className="mt-3 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm sm:max-w-md"
                >
                  <option value="">Selecciona un emprendimiento</option>
                  {entrepreneurs.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.business_name}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">
                Para guardar el diagnÃ³stico necesitas tener una ficha de emprendimiento creada.
              </p>
            )}
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-border bg-secondary/15 p-4">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Puedes realizar el diagnÃ³stico sin iniciar sesiÃ³n, pero para guardarlo en tu ficha y descargarlo posteriormente debes ingresar a tu cuenta.
            </p>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={onStart}
            disabled={isLoggedIn && entrepreneurs.length > 0 && !selectedEntrepreneurId}
          >
            Comenzar diagnÃ³stico
          </Button>
          {hasSaved ? (
            <Button type="button" variant="outline" onClick={onResume}>
              Continuar diagnÃ³stico guardado
            </Button>
          ) : null}
        </div>
      </section>
    </>
  );
}

function IntroCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <div className="text-primary">{icon}</div>
      <p className="mt-2 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{text}</p>
    </article>
  );
}

function QuestionView({
  question,
  value,
  index,
  total,
  onSelect,
  onBack,
  onNext,
}: {
  question: Question;
  value?: string;
  index: number;
  total: number;
  onSelect: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const progress = Math.round(((index + 1) / total) * 100);

  return (
    <section className="container-page py-7 sm:py-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">{question.section}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Pregunta {index + 1} de {total}
            </p>
          </div>
          <span className="text-xs font-semibold text-primary">{progress}%</span>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>

        <article className="mt-5 rounded-xl border border-border bg-card p-5 sm:p-6">
          <h1 className="font-display text-xl font-semibold leading-snug sm:text-2xl">
            {question.title}
          </h1>

          <div className="mt-5 grid gap-2">
            {question.options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelect(option.value)}
                className={
                  value === option.value
                    ? "rounded-xl border border-primary bg-secondary/30 px-4 py-3 text-left text-sm font-medium"
                    : "rounded-xl border border-border bg-background px-4 py-3 text-left text-sm transition-colors hover:border-primary/40 hover:bg-secondary/15"
                }
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-5 flex justify-between gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <Button type="button" size="sm" disabled={!value} onClick={onNext}>
              {index === total - 1 ? "Ver diagnÃ³stico" : "Continuar"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </article>
      </div>
    </section>
  );
}

type Recommendation = {
  priority: "alta" | "media";
  title: string;
  detail: string;
  organism?: string;
};

type Report = {
  overall: number;
  dimensions: { name: string; score: number }[];
  strengths: string[];
  priorities: Recommendation[];
  opportunities: Recommendation[];
  plan30: string[];
  plan90: string[];
};


const supportByDimension: Record<string, { where: string; support: string }> = {
  "FormalizaciÃ³n": {
    where: "Servicio de Impuestos Internos (SII) y, si crearÃ¡s una sociedad, Registro de Empresas y Sociedades.",
    support: "Centro de Desarrollo de Negocios Sercotec: orientaciÃ³n para ordenar el modelo y la formalizaciÃ³n.",
  },
  "Tributario": {
    where: "Servicio de Impuestos Internos (SII), presencialmente o mediante sus servicios en lÃ­nea.",
    support: "CapacitaciÃ³n en obligaciones tributarias, documentos y administraciÃ³n bÃ¡sica para pequeÃ±os negocios.",
  },
  "Municipal y permisos": {
    where: "Municipalidad correspondiente; DirecciÃ³n de Obras Municipales cuando el inmueble o habilitaciÃ³n lo requiera; SEREMI de Salud en materias sanitarias.",
    support: "Antes de invertir en infraestructura, solicita orientaciÃ³n sobre requisitos y compatibilidad del lugar con la actividad.",
  },
  "Finanzas": {
    where: "GestiÃ³n interna del negocio; contador/a cuando existan materias tributarias que deban validarse.",
    support: "Centro de Desarrollo de Negocios Sercotec: costos, precios, flujo de caja y rentabilidad.",
  },
  "Mercado y ventas": {
    where: "GestiÃ³n comercial del propio emprendimiento.",
    support: "Sercotec / Centro de Desarrollo de Negocios: modelo de negocio, marketing, ventas y canales digitales.",
  },
  "OperaciÃ³n": {
    where: "GestiÃ³n interna y proveedores tÃ©cnicos segÃºn la actividad.",
    support: "CapacitaciÃ³n tÃ©cnica sectorial y documentaciÃ³n de procesos crÃ­ticos.",
  },
  "Personas": {
    where: "DirecciÃ³n del Trabajo y organismos previsionales cuando existan trabajadores dependientes.",
    support: "OrientaciÃ³n laboral y prevenciÃ³n de riesgos segÃºn tamaÃ±o y actividad.",
  },
  "Digital": {
    where: "GestiÃ³n interna del emprendimiento.",
    support: "Ruta Digital de Sercotec u otras capacitaciones de digitalizaciÃ³n para MIPES.",
  },
  "Riesgos": {
    where: "GestiÃ³n interna; aseguradora, mutualidad u organismo sectorial cuando corresponda.",
    support: "Construir un plan simple de continuidad operacional y respaldo.",
  },
  "Crecimiento": {
    where: "GestiÃ³n interna; instituciones financieras o programas pÃºblicos sÃ³lo despuÃ©s de cuantificar la necesidad.",
    support: "Sercotec, Centros de Desarrollo de Negocios y programas pÃºblicos pertinentes al perfil del emprendedor.",
  },
  "Sectorial": {
    where: "Organismo sectorial competente segÃºn la actividad: Sernapesca, Sernatur, Ministerio de Transportes, SEC, SEREMI u otro que corresponda.",
    support: "Buscar capacitaciÃ³n tÃ©cnica y normativa especÃ­fica antes de invertir o ampliar operaciones.",
  },
};

function conclusionFor(q: Question, selected: Option): string {
  const d = q.dimension ?? "GestiÃ³n";
  const good: Record<string, string> = {
    "FormalizaciÃ³n": "La base de formalizaciÃ³n declarada se encuentra resuelta.",
    "Tributario": "El cumplimiento tributario evaluado presenta una base adecuada.",
    "Municipal y permisos": "Los permisos o habilitaciones consultados se encuentran resueltos segÃºn lo declarado.",
    "Finanzas": "Existe una prÃ¡ctica financiera favorable para controlar la rentabilidad.",
    "Mercado y ventas": "Existe una base comercial favorable para captar y gestionar clientes.",
    "OperaciÃ³n": "La operaciÃ³n evaluada muestra capacidad y orden para responder al negocio.",
    "Personas": "La gestiÃ³n de personas evaluada presenta una base adecuada.",
    "Digital": "La presencia digital facilita el contacto con potenciales clientes.",
    "Riesgos": "El negocio presenta una condiciÃ³n favorable frente al riesgo evaluado.",
    "Crecimiento": "Existe una base favorable para planificar la siguiente etapa.",
    "Sectorial": "El requisito sectorial evaluado se encuentra resuelto segÃºn lo declarado.",
  };
  return good[d] ?? `${d}: condiciÃ³n favorable detectada.`;
}

function actionCard(q: Question, selected: Option): Recommendation {
  const dimension = q.dimension ?? "GestiÃ³n";
  const support = supportByDimension[dimension] ?? {
    where: "Organismo o instituciÃ³n competente segÃºn la materia.",
    support: "Solicitar orientaciÃ³n especializada antes de ejecutar una inversiÃ³n relevante.",
  };
  return {
    priority: selected.severity === "critical" ? "alta" : "media",
    title: q.title,
    detail: `${selected.action ?? "Revisar esta materia y definir una acciÃ³n concreta."} DÃ³nde gestionarlo: ${selected.organism ?? support.where} Apoyo sugerido: ${support.support}`,
    organism: selected.organism,
  };
}

function buildReport(answers: AnswerMap): Report {
  const visible = visibleQuestions(answers);
  const buckets = new Map<string, { total: number; max: number }>();
  const strengths: string[] = [];
  const priorities: Recommendation[] = [];
  const opportunities: Recommendation[] = [];

  for (const q of visible) {
    if (!q.dimension) continue;
    const selected = q.options.find((o) => o.value === answers[q.id]);
    if (!selected || typeof selected.score !== "number") continue;

    const bucket = buckets.get(q.dimension) ?? { total: 0, max: 0 };
    bucket.total += selected.score;
    bucket.max += 4;
    buckets.set(q.dimension, bucket);

    if (selected.severity === "ok" && selected.score === 4) {
      strengths.push(conclusionFor(q, selected));
    }

    if (selected.severity === "critical" || selected.severity === "warning") {
      const item: Recommendation = actionCard(q, selected);
      if (item.priority === "alta") priorities.push(item);
      else opportunities.push(item);
    }
  }

  const dimensions = Array.from(buckets.entries())
    .map(([name, b]) => ({
      name,
      score: b.max ? Math.round((b.total / b.max) * 100) : 0,
    }))
    .sort((a, b) => a.score - b.score);

  const overall = dimensions.length
    ? Math.round(dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length)
    : 0;

  const merged = [...priorities, ...opportunities].filter(
    (item, i, all) =>
      all.findIndex((x) => x.title === item.title && x.detail === item.detail) === i,
  );

  const top = merged.slice(0, 5);

  return {
    overall,
    dimensions,
    strengths: Array.from(new Set(strengths)).slice(0, 6),
    priorities: top,
    opportunities: merged.slice(5, 11),
    plan30: [
      top[0] ? `Semana 1 Â· Validar requisito y reunir antecedentes: ${top[0].title}` : "Semana 1 Â· Revisar la situaciÃ³n formal y regulatoria del negocio.",
      top[0] ? `Semana 2 Â· Ejecutar o iniciar la gestiÃ³n prioritaria. ${top[0].detail}` : "Semana 2 Â· Ordenar costos, precios y caja.",
      top[1] ? `Semana 3 Â· Abordar la segunda brecha: ${top[1].detail}` : "Semana 3 Â· Validar clientes y canales de venta.",
      top[2] ? `Semana 4 Â· Dejar evidencia, responsables y fecha de cierre para: ${top[2].title}` : "Semana 4 Â· Definir metas y seguimiento mensual.",
    ],
    plan90: [
      top[0]
        ? `Mes 1 Â· Base habilitante: cerrar o dejar formalmente encaminadas las brechas crÃ­ticas antes de nuevas inversiones. Prioridad: ${top[0].title}`
        : "Mes 1 Â· Consolidar formalizaciÃ³n, permisos y control financiero.",
      top[1]
        ? `Mes 2 Â· GestiÃ³n: ordenar costos, procesos y ventas mientras se completa: ${top[1].title}`
        : "Mes 2 Â· Mejorar rentabilidad, operaciÃ³n y gestiÃ³n comercial.",
      top[2]
        ? `Mes 3 Â· Crecimiento condicionado: invertir o expandirse sÃ³lo si las brechas crÃ­ticas estÃ¡n resueltas y existe demanda validada. Revisar: ${top[2].title}`
        : "Mes 3 Â· Evaluar crecimiento sÃ³lo con demanda, capacidad y caja validadas.",
    ],
  };
}

function ReportView({
  report,
  answers,
  onRestart,
  savedDiagnosticId,
}: {
  report: Report;
  answers: AnswerMap;
  onRestart: () => void;
  savedDiagnosticId: string | null;
}) {
  const sectorLabel =
    sectors.find(([value]) => value === answers.sector)?.[1] ??
    "Actividad no clasificada";

  const priorities = report.priorities.slice(0, 3);
  const strengths = report.strengths.slice(0, 3);
  const opportunities = report.opportunities.slice(0, 3);
  const isExcellent = report.overall >= 95;
  const growthSteps = [
    {
      title: "Proteger lo que ya funciona",
      detail:
        "Documenta los procesos, controles y prÃ¡cticas que hoy sostienen el buen desempeÃ±o para evitar retrocesos y facilitar su continuidad.",
    },
    {
      title: "Medir con indicadores",
      detail:
        "Define un tablero simple con ventas, margen, clientes recurrentes, costos, caja y cumplimiento para detectar desviaciones a tiempo.",
    },
    {
      title: "Fortalecer clientes y mercado",
      detail:
        "Analiza quÃ© clientes, productos o servicios generan mayor valor y concentra el esfuerzo comercial en los segmentos con mejores resultados.",
    },
    {
      title: "Evaluar nuevas oportunidades",
      detail:
        "Prueba nuevos canales, alianzas, productos o territorios en pequeÃ±a escala antes de comprometer inversiones relevantes.",
    },
    {
      title: "Preparar el siguiente nivel",
      detail:
        "Define una meta concreta de crecimiento para los prÃ³ximos 90 dÃ­as y asÃ­gnale responsables, recursos, fecha y criterio de Ã©xito.",
    },
  ];
  const steps = isExcellent
    ? growthSteps
    : [...report.priorities, ...report.opportunities].slice(0, 5);
  const dimensions = report.dimensions.slice(0, 8);

  const cleanTitle = (title: string) => {
    const t = title.replace(/[Â¿?]/g, "").trim();
    if (/funciona legalmente|forma.*legal/i.test(t)) return "Definir la forma legal";
    if (/inicio de actividades/i.test(t)) return "FormalizaciÃ³n tributaria";
    if (/seguimiento.*clientes|personas interesadas/i.test(t)) return "GestiÃ³n comercial";
    if (/no pudieras trabajar/i.test(t)) return "Continuidad del negocio";
    if (/patente|permiso municipal/i.test(t)) return "Patente y permisos";
    if (/inmueble|terreno/i.test(t)) return "HabilitaciÃ³n del lugar";
    if (/sanitaria/i.test(t)) return "AutorizaciÃ³n sanitaria";
    if (/costos|margen|precio/i.test(t)) return "Costos y rentabilidad";
    if (/mermas|pÃ©rdidas/i.test(t)) return "Control de mermas";
    if (/digital|redes|internet/i.test(t)) return "Presencia digital";
    return t.length > 44 ? `${t.slice(0, 41)}â€¦` : t;
  };

  const actionOnly = (detail: string) =>
    detail.split("DÃ³nde gestionarlo:")[0].trim();

  const whereOnly = (detail: string) => {
    const m = detail.match(/DÃ³nde gestionarlo:\s*(.*?)(?:\s+Apoyo sugerido:|$)/);
    return m?.[1]?.trim() ?? "";
  };

  const businessName =
    answers.nombre_emprendimiento === "sin_nombre"
      ? "Emprendimiento sin nombre definido"
      : answers.nombre_emprendimiento === "registrado"
      ? (answers.nombre_ficha || answers.emprendimiento || "Nombre pendiente de ficha")
      : answers.nombre_emprendimiento || answers.nombre_ficha || answers.emprendimiento || "No informado";

  const entrepreneurName =
    answers.nombre_emprendedor === "titular"
      ? "Titular / responsable principal"
      : answers.nombre_emprendedor === "socios"
      ? "Socios/as"
      : answers.nombre_emprendedor === "familia"
      ? "Emprendimiento familiar"
      : answers.nombre_emprendedor === "equipo"
      ? "Equipo responsable"
      : answers.nombre_emprendedor || "No informado";

  const stageLabel =
    answers.etapa === "idea" ? "Idea / preparaciÃ³n"
    : answers.etapa === "inicio" ? "Inicio"
    : answers.etapa === "operando" ? "En funcionamiento"
    : answers.etapa === "crecimiento" ? "Crecimiento"
    : answers.etapa === "consolidado" ? "Consolidado"
    : answers.etapa || "No informada";

  const comunaLabel = answers.comuna || answers.comuna_ficha || "No informada";
  const reportDate = new Intl.DateTimeFormat("es-CL", {
    day: "2-digit", month: "2-digit", year: "numeric"
  }).format(new Date());

  const executiveMessage =
    isExcellent
      ? `El diagnÃ³stico muestra un emprendimiento con un nivel de desarrollo sobresaliente en las dimensiones evaluadas. No se observan brechas prioritarias que requieran correcciÃ³n inmediata. El foco recomendado cambia desde resolver falencias hacia consolidar lo logrado, medir sistemÃ¡ticamente el desempeÃ±o y aprovechar oportunidades de crecimiento con disciplina. El desafÃ­o ahora es sostener este estÃ¡ndar en el tiempo y transformar una buena base en mayor rentabilidad, resiliencia y capacidad de expansiÃ³n.`
      : report.overall >= 75
      ? `El diagnÃ³stico muestra un emprendimiento con una base favorable y fortalezas que conviene proteger. El siguiente desafÃ­o es aprovechar las oportunidades detectadas, cerrar brechas especÃ­ficas y transformar esos avances en mayor rentabilidad, capacidad de gestiÃ³n y crecimiento sostenible. Las prioridades seÃ±aladas no buscan frenar el negocio, sino concentrar el esfuerzo donde puede generar mayor impacto.`
      : report.overall >= 50
      ? `El diagnÃ³stico muestra avances relevantes y capacidades sobre las cuales seguir construyendo. Al mismo tiempo, existen espacios de mejora que hoy limitan parte del potencial del emprendimiento. La recomendaciÃ³n es mantener y reforzar lo que ya funciona, resolver primero las brechas prioritarias y aprovechar las oportunidades detectadas para ordenar la gestiÃ³n, mejorar resultados y preparar una siguiente etapa de crecimiento.`
      : `El diagnÃ³stico identifica aspectos positivos que constituyen una base para avanzar, pero tambiÃ©n brechas que hoy requieren atenciÃ³n y oportunidades que todavÃ­a no estÃ¡n siendo plenamente aprovechadas. La recomendaciÃ³n es concentrarse primero en los temas habilitantes y de mayor impacto, fortalecer lo que ya se estÃ¡ haciendo bien y avanzar paso a paso sobre los espacios de mejora. Resolver estas prioridades permitirÃ¡ construir un emprendimiento mÃ¡s ordenado, seguro, rentable y preparado para crecer.`;

  return (
    <section className="container-page py-7 sm:py-8">
      <style>{`
        @page { size: A4 portrait; margin: 8mm; }
        @media print {
          header, footer, .no-print { display:none !important; }
          html, body { background:white !important; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
          .diagnostic-report { max-width:none !important; font-size:9px !important; }
          .diagnostic-page { page-break-after:always !important; break-after:page !important; min-height:0 !important; }
          .diagnostic-page:last-child { page-break-after:auto !important; break-after:auto !important; }
          .diagnostic-report article, .diagnostic-report section { break-inside:avoid !important; page-break-inside:avoid !important; }
          .diagnostic-report .page-title { font-size:22px !important; }
          .diagnostic-report .section-title { font-size:14px !important; }
        }
      `}</style>

      <div className="diagnostic-report mx-auto max-w-5xl">
        {/* HOJA 1 Â· IDENTIFICACIÃ“N + RESUMEN EJECUTIVO */}
        <div className="diagnostic-page">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
            <div>
              <p className="eyebrow">RESULTADO</p>
              <h1 className="mt-1 page-title">DiagnÃ³stico del Emprendedor</h1>
              <p className="mt-1 text-sm text-muted-foreground">{sectorLabel}</p>
            </div>

            <div className="rounded-xl border border-border bg-secondary/15 px-5 py-3 text-right">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Ãndice orientativo</p>
              <p className="font-display text-4xl font-semibold leading-none">{report.overall}<span className="text-sm text-muted-foreground">/100</span></p>
            </div>
          </div>

          <div className="no-print mt-3 flex flex-wrap justify-end gap-2">
            {savedDiagnosticId ? (
              <Button asChild type="button" variant="outline" size="sm">
                <Link to="/diagnosticos/$id" params={{ id: savedDiagnosticId }}>
                  Ver diagnÃ³stico guardado
                </Link>
              </Button>
            ) : null}

            <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
              <Download className="h-4 w-4" /> Informe PDF
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onRestart}>
              <RotateCcw className="h-4 w-4" /> Nuevo diagnÃ³stico
            </Button>
          </div>

          <section className="mt-3 rounded-xl border border-border bg-card p-3">
            <p className="eyebrow">IDENTIFICACIÃ“N DEL EMPRENDIMIENTO</p>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] sm:grid-cols-3">
              <p><span className="font-semibold">Emprendimiento:</span> {businessName}</p>
              <p><span className="font-semibold">Responsable:</span> {entrepreneurName}</p>
              <p><span className="font-semibold">Rubro:</span> {sectorLabel}</p>
              <p><span className="font-semibold">Comuna:</span> {comunaLabel}</p>
              <p><span className="font-semibold">Etapa:</span> {stageLabel}</p>
              <p><span className="font-semibold">Fecha:</span> {reportDate}</p>
            </div>
          </section>

          <section className="mt-3 rounded-xl border border-border bg-secondary/15 p-4">
            <p className="eyebrow">LECTURA EJECUTIVA</p>
            <h2 className="mt-1 section-title">Una mirada general a tu emprendimiento</h2>
            <p className="mt-2 text-[11px] leading-relaxed">{executiveMessage}</p>
          </section>

          <section className="mt-3 grid gap-3 md:grid-cols-2">
            <article className="rounded-xl border border-border bg-card p-4">
              <p className="eyebrow">FORTALEZAS</p>
              <h2 className="mt-1 section-title">Lo que conviene mantener y potenciar</h2>
              <div className="mt-2 space-y-2">
                {strengths.length ? strengths.map((s,i)=>(
                  <div key={i}>
                    <p className="text-[11px] font-semibold">âœ“ {cleanTitle(s)}</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">{s}</p>
                  </div>
                )) : <p className="text-[10px] text-muted-foreground">EstÃ¡s construyendo las bases del negocio. El foco inicial serÃ¡ convertir avances incipientes en fortalezas sostenibles.</p>}
              </div>
            </article>

            <article className="rounded-xl border border-border bg-card p-4">
              <p className="eyebrow">{isExcellent ? "OPORTUNIDADES DE CRECIMIENTO" : "OPORTUNIDADES Y BRECHAS"}</p>
              <h2 className="mt-1 section-title">
                {isExcellent ? "CÃ³mo aprovechar una base sobresaliente" : "DÃ³nde existe mayor espacio para avanzar"}
              </h2>
              <div className="mt-2 space-y-2">
                {(isExcellent ? growthSteps.slice(0,3) : [...priorities, ...opportunities].slice(0,3)).map((item,i)=>(
                  <div key={i}>
                    <p className="text-[11px] font-semibold">{i+1}. {cleanTitle(item.title)}</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">{actionOnly(item.detail)}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="mt-3">
            <p className="eyebrow">MAPA DE SITUACIÃ“N</p>
            <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {dimensions.map(d=>(
                <div key={d.name} className="rounded-lg border border-border bg-card px-2.5 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[9px] font-medium">{d.name}</span>
                    <span className="text-[10px] font-semibold">{d.score}%</span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{width:`${d.score}%`}} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* HOJA 2 Â· PRIORIDADES + PASO A PASO */}
        <div className="diagnostic-page">
          <section className="rounded-xl border border-border bg-card p-4">
            <p className="eyebrow">PASO A PASO</p>
            <h2 className="mt-1 section-title">QuÃ© hacer ahora</h2>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {isExcellent
                ? "Con una base sobresaliente, el objetivo es consolidar, medir y crecer de manera controlada. Este es el orden recomendado."
                : "A partir de las brechas y oportunidades detectadas, este es el orden recomendado para avanzar. Cada paso resuelto facilita el siguiente."}
            </p>

            <div className="mt-3 space-y-2">
              {steps.map((item,i)=>(
                <div key={i} className="grid grid-cols-[26px_1fr] gap-2.5 rounded-lg border border-border bg-background p-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold">{i+1}</span>
                  <div>
                    <p className="text-[11px] font-semibold">{cleanTitle(item.title)}</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed">{actionOnly(item.detail)}</p>
                    {whereOnly(item.detail) && <p className="mt-0.5 text-[9px] text-muted-foreground"><span className="font-semibold text-foreground">DÃ³nde:</span> {whereOnly(item.detail)}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-3 grid gap-3 md:grid-cols-2">
            <article className="rounded-xl border border-border bg-secondary/15 p-3">
              <p className="eyebrow">APOYO Y CAPACITACIÃ“N</p>
              <p className="mt-1 text-[10px] leading-relaxed">
                Para gestiÃ³n, costos, ventas y digitalizaciÃ³n, busca apoyo en Sercotec y Centros de Desarrollo de Negocios. Para materias regulatorias, valida directamente con SII, Municipalidad, SEREMI u organismo sectorial competente.
              </p>
            </article>
            <article className="rounded-xl border border-border bg-card p-3">
              <p className="eyebrow">ANTES DE INVERTIR MÃS</p>
              <p className="mt-1 text-[10px] leading-relaxed">
                {isExcellent
                  ? "Antes de aumentar costos fijos o realizar inversiones relevantes, valida la oportunidad con datos, una prueba acotada y metas claras de retorno."
                  : "Primero deja encaminadas las brechas prioritarias. Luego mide resultados y reciÃ©n despuÃ©s evalÃºa nuevas inversiones, costos fijos o expansiÃ³n."}
              </p>
            </article>
          </section>
        </div>

        {/* HOJA 3 Â· RUTA + CIERRE */}
        <div className="diagnostic-page">
          <section className="rounded-xl border border-border bg-card p-5">
            <p className="eyebrow">HOJA DE RUTA</p>
            <h2 className="mt-1 section-title">
              {isExcellent ? "De consolidar a crecer" : "De ordenar a crecer"}
            </h2>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {isExcellent
                ? "Una secuencia simple para sostener el buen desempeÃ±o y preparar el siguiente nivel."
                : "Una secuencia simple para transformar el diagnÃ³stico en avance."}
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">0â€“30 dÃ­as</p>
                <p className="mt-1 text-xs font-semibold">
                  {isExcellent ? "Consolidar y documentar" : "Resolver lo habilitante"}
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                  {isExcellent
                    ? "Documenta procesos, indicadores y prÃ¡cticas clave para asegurar continuidad y consistencia."
                    : priorities[0]
                    ? actionOnly(priorities[0].detail)
                    : "Ordenar la base formal y de gestiÃ³n."}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">31â€“60 dÃ­as</p>
                <p className="mt-1 text-xs font-semibold">
                  {isExcellent ? "Medir y optimizar" : "Gestionar y medir"}
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                  {isExcellent
                    ? "Usa indicadores para identificar los productos, clientes y procesos que mÃ¡s aportan a rentabilidad y estabilidad."
                    : "Implementa controles simples sobre ventas, costos, clientes y operaciÃ³n para saber quÃ© estÃ¡ funcionando."}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">61â€“90 dÃ­as</p>
                <p className="mt-1 text-xs font-semibold">Preparar el crecimiento</p>
                <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                  {isExcellent
                    ? "EvalÃºa una oportunidad concreta de expansiÃ³n, alianza o nuevo canal con demanda, capacidad, caja y retorno previamente validados."
                    : "Con las brechas principales encaminadas, evalÃºa oportunidades de inversiÃ³n o expansiÃ³n con demanda, capacidad y caja validadas."}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-4 rounded-xl border border-border bg-secondary/15 p-5">
            <p className="eyebrow">MENSAJE FINAL</p>
            <h2 className="mt-1 section-title">
              {isExcellent
                ? "El desafÃ­o ya no es corregir: es sostener, medir y crecer con criterio."
                : "El diagnÃ³stico no busca detenerte: busca ayudarte a avanzar mejor."}
            </h2>
            <p className="mt-2 text-xs leading-relaxed">
              {isExcellent
                ? "Has construido una base sÃ³lida en las dimensiones evaluadas. El siguiente paso es cuidar ese estÃ¡ndar, convertir la informaciÃ³n en decisiones y seleccionar oportunidades de crecimiento que realmente agreguen valor. Un buen resultado no significa detenerse: significa que estÃ¡s en condiciones de avanzar con mayor control y ambiciÃ³n."
                : "No necesitas resolver todo de una vez. Reconoce lo que ya has construido, concÃ©ntrate en las oportunidades y brechas que pueden generar mayor impacto y avanza paso a paso. Cada mejora fortalece tu emprendimiento y te acerca a un negocio mÃ¡s ordenado, rentable, sostenible y preparado para crecer."}
            </p>
          </section>

          <section className="mt-4 border-t border-border pt-3">
            <p className="text-[9px] leading-relaxed text-muted-foreground">
              Herramienta de orientaciÃ³n basada en la informaciÃ³n proporcionada. Los requisitos legales, tributarios, sanitarios, municipales o sectoriales deben validarse ante el organismo competente.
            </p>
            <div className="mt-2 text-[9px] text-muted-foreground">
              <span className="font-semibold text-foreground">MetodologÃ­a y desarrollo:</span> Ãlvaro DÃ­az Barros Â· <span className="font-semibold text-foreground">Asistencia tecnolÃ³gica:</span> Inteligencia Artificial
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

function Plan({
  title,
  eyebrow,
  items,
}: {
  title: string;
  eyebrow: string;
  items: string[];
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-5">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-1 section-title">{title}</h2>
      <div className="mt-3 space-y-2">
        {items.length ? items.map((item, i) => (
          <div
            key={i}
            className="rounded-lg bg-secondary/15 px-3 py-2.5 text-xs leading-relaxed"
          >
            {item}
          </div>
        )) : (
          <p className="text-xs text-muted-foreground">Sin acciones pendientes prioritarias.</p>
        )}
      </div>
    </article>
  );
}

