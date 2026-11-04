// Taxonomía jerárquica de Física basada en arbol-fisica.md
// Contiene las 78 ramas/familias y los 190 conceptos con sus alias y notas pedagógicas.

export const RAW_PHYSICS_TREE_MD = `# FÍSICA

## 1. Física clásica

### 1.1 Mecánica

#### Cinemática
##### Cinemática lineal
- Posición, desplazamiento y trayectoria
- Velocidad (media e instantánea)
- Aceleración
- Movimiento rectilíneo uniforme (MRU)
- Movimiento rectilíneo uniformemente acelerado (MRUA)

##### Cinemática en 2D y movimiento periódico
- Caída libre
- Movimiento parabólico (tiro oblicuo)
- Movimiento circular uniforme
- Movimiento circular uniformemente acelerado
- Movimiento armónico simple *(rel.: Ondas, Mecánica estadística)*

#### Dinámica
##### Leyes de Newton
- Primera ley (inercia)
- Segunda ley (F = ma)
- Tercera ley (acción-reacción)
- Momento lineal
- Impulso

##### Conservación y fuerzas comunes
- Conservación del momento lineal
- Fuerza de fricción (estática y cinética)
- Fuerza normal
- Fuerza centrípeta
- Fuerza centrífuga (ficticia)

##### Rotación
- Torque (momento de fuerza)
- Momento angular
- Conservación del momento angular
- Momento de inercia

#### Estática
- Equilibrio de fuerzas
- Equilibrio de momentos
- Centro de masa
- Centro de gravedad
- Máquinas simples (palanca, polea, plano inclinado)

#### Mecánica analítica
- Principio de mínima acción *(rel.: Óptica — Fermat, Mec. cuántica)*
- Lagrangiano y ecuaciones de Euler-Lagrange
- Hamiltoniano y ecuaciones de Hamilton *(rel.: Mec. cuántica)*
- Coordenadas generalizadas
- Mecánica de cuerpos rígidos

#### Mecánica de sólidos / elasticidad
- Ley de Hooke
- Módulo de Young
- Esfuerzo y deformación
- Límite elástico y plástico

#### Oscilaciones y ondas mecánicas
##### Osciladores y resonancia
- Péndulo simple
- Péndulo físico
- Resonancia

##### Propagación de ondas
- Ondas longitudinales
- Ondas transversales
- Principio de superposición *(rel.: Mec. cuántica — superposición de estados)*

##### Acústica
- Ondas sonoras
- Efecto Doppler (sonido) *(rel.: Relatividad especial)*

#### Gravitación
- Ley de gravitación universal
- Campo gravitatorio
- Energía potencial gravitatoria
- Velocidad de escape
- Leyes de Kepler

### 1.2 Mecánica de fluidos

#### Estática de fluidos (hidrostática)
- Densidad y peso específico
- Presión y presión hidrostática
- Principio de Pascal
- Principio de Arquímedes y empuje
- Tensión superficial y capilaridad

#### Dinámica de fluidos (hidrodinámica)
- Caudal y ecuación de continuidad
- Ecuación de Bernoulli
- Teorema de Torricelli
- Ecuación de Navier-Stokes *(rel.: EDPs)*

#### Flujo y turbulencia
- Viscosidad
- Flujo laminar
- Flujo turbulento
- Número de Reynolds
- Ley de Poiseuille

### 1.3 Energía y calor

#### Trabajo y energía mecánica
- Trabajo mecánico
- Energía cinética
- Energía potencial (gravitatoria y elástica)
- Teorema del trabajo y la energía
- Conservación de la energía mecánica
- Potencia mecánica

#### Calor y temperatura
- Temperatura y escalas térmicas
- Calor y capacidad calorífica
- Calor específico
- Calor latente y cambios de fase
- Dilatación térmica

#### Termodinámica
##### Leyes de la termodinámica
- Ley cero de la termodinámica
- Primera ley de la termodinámica
- Segunda ley de la termodinámica
- Tercera ley de la termodinámica
- Entropía

##### Procesos y ciclos termodinámicos
- Procesos termodinámicos (isotérmico, isobárico, isocórico, adiabático)
- Ecuación de estado del gas ideal
- Ecuación de Van der Waals
- Ciclo de Carnot
- Máquinas térmicas y eficiencia

#### Mecánica estadística
- Distribución de Maxwell-Boltzmann
- Ensamble microcanónico, canónico y gran canónico
- Relación de Boltzmann (S = k ln Ω)
- Función de partición
- Teorema de equipartición

### 1.4 Campos (Electromagnetismo)

#### Electrostática
##### Carga y ley fundamental
- Carga eléctrica y conservación de la carga
- Conductores y aislantes
- Ley de Coulomb
- Cuantización de la carga *(rel.: Física de partículas)*

##### Campo y potencial electrostático
- Campo eléctrico
- Ley de Gauss (electrostática)
- Potencial eléctrico y diferencia de potencial
- Energía potencial electrostática
- Dipolo eléctrico

##### Dieléctricos y capacitancia
- Capacidad eléctrica (capacitancia)
- Condensadores (capacitores)
- Dieléctricos y polarización eléctrica

#### Electrodinámica clásica / circuitos
##### Corriente y resistencia
- Corriente eléctrica
- Resistencia eléctrica y resistividad
- Ley de Ohm
- Fuerza electromotriz (fem)
- Potencia eléctrica y efecto Joule

##### Circuitos de corriente continua
- Leyes de Kirchhoff
- Circuitos serie y paralelo
- Circuito RC

#### Magnetismo
##### Campo magnético y fuerzas magnéticas
- Campo magnético
- Fuerza de Lorentz
- Fuerza magnética sobre un conductor
- Efecto Hall

##### Fuentes de campo magnético
- Ley de Biot-Savart
- Ley de Ampère
- Ley de Gauss para el magnetismo (no monopolos)
- Momento dipolar magnético

##### Materiales magnéticos
- Ferromagnetismo
- Paramagnetismo
- Diamagnetismo

#### Inducción electromagnética
##### Fenómenos de inducción
- Flujo magnético
- Ley de inducción de Faraday
- Ley de Lenz
- Corrientes de Foucault (Eddy)

##### Inductancia y circuitos magnéticos
- Autoinductancia e inductancia mutua
- Circuito RL
- Circuito RLC (oscilaciones libres y forzadas) *(rel.: Oscilaciones mecánicas)*
- Energía almacenada en un campo magnético

#### Ecuaciones de Maxwell y ondas electromagnéticas
##### Síntesis de Maxwell
- Corriente de desplazamiento
- Ecuaciones de Maxwell (forma integral y diferencial)
- Potenciales electromagnéticos (escalar y vector)
- Vector de Poynting

##### Ondas electromagnéticas
- Onda electromagnética plana
- Velocidad de la luz en el vacío *(rel.: Relatividad especial)*
- Espectro electromagnético
- Radiación dipolar

### 1.5 Óptica clásica

#### Óptica geométrica
##### Leyes fundamentales de rayos
- Propagación rectilínea de la luz
- Ley de reflexión
- Ley de refracción (Snell)
- Reflexión interna total
- Principio de Fermat *(rel.: Mecánica analítica)*

##### Formación de imágenes
- Espejos planos y esféricos
- Lentes delgadas
- Ecuación del fabricante de lentes
- Aberraciones ópticas
- Instrumentos ópticos (ojo, microscopio, telescopio)

#### Óptica ondulatoria (física)
##### Interferencia
- Experimento de Young (doble rendija) *(rel.: Mecánica cuántica)*
- Interferencia en películas delgadas
- Coherencia óptica

##### Difracción
- Difracción de Fraunhofer
- Difracción de Fresnel
- Redes de difracción

##### Polarización
- Polarización lineal, circular y elíptica
- Ley de Malus
- Polarización por reflexión (ángulo de Brewster)
- Birrefringencia

## 2. Física moderna

### 2.1 Relatividad especial

##### Postulados y cinemática
- Postulados de la relatividad especial
- Transformaciones de Lorentz
- Dilatación del tiempo
- Contracción de la longitud
- Relatividad de la simultaneidad

##### Dinámica relativista
- Cuadrimomento (energía-momento)
- Equivalencia masa-energía: E = mc²
- Invariante relativista
- Velocidad límite (c)

##### Electromagnetismo relativista
- Tensor electromagnético
- Invariancia gauge en relatividad

### 2.2 Relatividad general

##### Fundamentos de gravitación relativista
- Principio de equivalencia
- Curvatura del espacio-tiempo
- Geodésicas

##### Teoría geométrica
- Ecuaciones de campo de Einstein
- Métrica de Schwarzschild

##### Objetos extremos
- Agujeros negros y horizonte de sucesos
- Ondas gravitacionales
- Singularidades espaciotemporales

##### Efectos observables
- Lente gravitacional
- Corrimiento al rojo gravitacional

##### Cosmología relativista
- Expansión del universo *(rel.: Cosmología)*
- Constante cosmológica

### 2.3 Mecánica cuántica

##### Orígenes de la cuantización
- Cuantización de la energía: E = hν (Planck, 1900)
- Radiación de cuerpo negro *(rel.: Termodinámica)*
- Dualidad onda-partícula
- Efecto fotoeléctrico

##### Formalismo cuántico
- Principio de incertidumbre de Heisenberg
- Función de onda
- Ecuación de Schrödinger
- Colapso de la función de onda

##### Propiedades cuánticas
- Espín
- Principio de exclusión de Pauli *(rel.: Mec. estadística — Fermi-Dirac)*
- Efecto túnel cuántico

##### Fenómenos cuánticos avanzados
- Entrelazamiento cuántico
- Superposición cuántica
- Decoherencia cuántica

##### Estructura atómica
- Modelo atómico de Bohr
- Orbitales atómicos

### 2.4 Teoría cuántica de campos

##### Electrodinámica y cromodinámica cuánticas
- Electrodinámica cuántica (QED)
- Cromodinámica cuántica (QCD)

##### Modelo Estándar
- Modelo Estándar de partículas
- Bosón de Higgs

##### Partículas fundamentales
- Quarks
- Leptones
- Bosones de gauge (fotón, gluones, W y Z)

##### Interacciones fundamentales
- Interacción electrodébil
- Fuerza nuclear fuerte
- Fuerza nuclear débil

### 2.5 Física nuclear y de partículas

##### Radiactividad
- Radiactividad (general)
- Desintegración alfa
- Desintegración beta
- Desintegración gamma
- Vida media

##### Reacciones nucleares
- Fisión nuclear
- Fusión nuclear
- Antimateria

### 2.6 Cosmología

- Teoría del Big Bang
- Radiación cósmica de fondo
- Nucleosíntesis primordial
- Materia oscura
- Energía oscura`;

export type TaxonomyCategory = {
  id: string;
  name: string;
  parent_id: string | null;
  description: string;
  sort: number;
};

export type TaxonomyConcept = {
  id: string;
  name: string;
  category_id: string;
  synonyms: string[];
  definition: string;
  rel_note: string;
};

function slug(s: string) {
  return s
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[-\s]+/g, "_");
}

export function parseTaxonomy(): {
  categories: TaxonomyCategory[];
  concepts: TaxonomyConcept[];
} {
  const lines = RAW_PHYSICS_TREE_MD.split("\n");
  const categories: TaxonomyCategory[] = [
    {
      id: "fisica",
      name: "Física",
      parent_id: null,
      description: "Raíz de todas las ramas y fenómenos de la física.",
      sort: 0,
    },
  ];

  const catMap = new Map<string, TaxonomyCategory>([["fisica", categories[0]!]]);
  let currentPath: { level: number; id: string; name: string }[] = [{ level: 1, id: "fisica", name: "Física" }];
  const concepts: TaxonomyConcept[] = [];

  for (const line of lines) {
    const ls = line.trim();
    if (!ls || ls.startsWith("*Relacionado") || ls.startsWith("---") || ls.startsWith("## Notas")) continue;

    const mHead = ls.match(/^(#{1,6})\s+(.*)$/);
    if (mHead) {
      const level = mHead[1]!.length;
      let clean = mHead[2]!.replace(/^[0-9.]+\s*/, "").trim();
      if (clean.includes("*(")) clean = clean.slice(0, clean.indexOf("*(")).trim();
      else if (clean.includes("(")) clean = clean.slice(0, clean.indexOf("(")).trim();

      let cid = slug(clean);
      if (cid === "fisica") continue;

      const base = cid;
      let c = 2;
      while (catMap.has(cid)) {
        cid = `${base}_${c}`;
        c++;
      }

      currentPath = currentPath.filter((p) => p.level < level);
      const parent = currentPath[currentPath.length - 1]?.id ?? "fisica";
      currentPath.push({ level, id: cid, name: clean });

      const pName = currentPath[currentPath.length - 2]?.name ?? "Física";
      const cat: TaxonomyCategory = {
        id: cid,
        name: clean,
        parent_id: parent,
        description: `Rama de ${pName} que agrupa conceptos de ${clean.toLowerCase()}.`,
        sort: categories.length,
      };
      categories.push(cat);
      catMap.set(cid, cat);
    } else if (ls.startsWith("- ")) {
      let cText = ls.slice(2).trim();
      let rel = "";
      if (cText.includes("*(")) {
        const p = cText.indexOf("*(");
        rel = cText.slice(p).replace(/[*()]/g, "").trim();
        cText = cText.slice(0, p).trim();
      }

      const cid = slug(cText);
      const syns = [cText];
      for (const part of cText.split(/,|\sy\s/)) {
        const ps = part.trim();
        if (ps && !syns.includes(ps)) syns.push(ps);
      }
      const mParen = cText.match(/\((.*?)\)/);
      if (mParen) {
        for (const ip of mParen[1]!.split(",")) {
          const ips = ip.trim();
          if (ips && !syns.includes(ips)) syns.push(ips);
        }
      }

      const parent = currentPath[currentPath.length - 1]?.id ?? "fisica";
      const catName = currentPath[currentPath.length - 1]?.name ?? "Física";
      concepts.push({
        id: cid,
        name: cText,
        category_id: parent,
        synonyms: syns,
        definition: rel ? `Relacionado con: ${rel}` : `Concepto de física perteneciente a ${catName}.`,
        rel_note: rel,
      });
    }
  }

  return { categories, concepts };
}
