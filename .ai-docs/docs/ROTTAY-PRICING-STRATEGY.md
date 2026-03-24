# ROTTAY - Estrategia de Precios | Enero 2026

## Estudio de Mercado Completo: USA, Europa y LATAM

> **Full-Stack Platform: Backend + Frontend + Infrastructure + Web3**

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Metodologia](#metodologia)
3. [Analisis por Vertical](#analisis-por-vertical)
4. [Design System & Frontend](#design-system--frontend)
5. [Web3 & Blockchain Pricing](#web3--blockchain-pricing)
6. [Precios Regionales](#precios-regionales)
7. [Propuesta de Valor: All-In-One](#propuesta-de-valor-all-in-one)
8. [Estrategia Conservadora vs Agresiva](#estrategia-conservadora-vs-agresiva)
9. [Recomendaciones Finales](#recomendaciones-finales)

---

## Resumen Ejecutivo

Este documento presenta una estrategia de precios basada en investigacion de mercado real para los 6 productos de Rottay, considerando diferencias regionales entre USA, Europa y LATAM.

### Fuentes Utilizadas

| Categoria | Fuentes |
|-----------|---------|
| ATS/Recruiting | Greenhouse, Lever, Workable, Bullhorn (glassdoor.com, vendr.com, capterra.com) |
| Ticketing | Eventbrite, Ticketmaster (eventbrite.com, eventcube.io) |
| Restaurant POS | Toast, Square (toasttab.com, merchantmaverick.com) |
| Lending | MeridianLink, LendFoundry, TurnKey Lender (softwareadvice.com) |
| Gaming | SOFTSWISS, EveryMatrix, GR8 Tech (affpapa.com, sdlccorp.com) |
| Computer Vision | V-Count, Trakwell.ai, Google Vision (trakwell.ai) |
| Regional Pricing | Monetizely, OpenView Partners, PYMNTS (getmonetizely.com) |

---

## Metodologia

### Factores Considerados

1. **Precios de competidores directos** en cada vertical
2. **Poder adquisitivo regional** (PPP - Purchasing Power Parity)
3. **Costo de mano de obra** que reemplazamos (recruiters, DevOps, etc.)
4. **Valor diferencial** de Rottay (all-in-one, compliance incluido, escalabilidad)
5. **Margenes tipicos** del mercado SaaS B2B (40-60%)

### Benchmark de Descuentos Regionales (Industria SaaS)

```
+------------------------------------------------------------------+
|                  DESCUENTOS REGIONALES ESTANDAR                   |
+------------------------------------------------------------------+
|                                                                   |
|  Region                    Descuento vs USA    Fuente             |
|  ------------------------------------------------------------     |
|  USA                       Base (0%)           -                  |
|  Europa Occidental         0% a +10%           Monetizely         |
|  Europa del Este           -20% a -30%         Monetizely         |
|  Brasil                    -30% a -40%         Monetizely         |
|  Mexico                    -25% a -35%         Monetizely         |
|  Argentina/Chile/Colombia  -30% a -40%         Monetizely         |
|  India                     -40% a -60%         Monetizely         |
|                                                                   |
+------------------------------------------------------------------+

Fuente: OpenView Partners SaaS Benchmarks 2023, Monetizely 2024
```

---

## Analisis por Vertical

### 1. BITHIRE (Recruiting/ATS)

#### Competidores y Precios

| Competidor | Precio | Modelo | Fuente |
|------------|--------|--------|--------|
| **Greenhouse** | $6,000-$140,000/ano | Por empresa | vendr.com, toggl.com |
| **Lever** | $499+/mes | Por empresa | lever.co |
| **Workable** | $149/mes por job slot | Por puesto | workable.com |
| **Bullhorn** (staffing) | $99-$200/usuario/mes | Por usuario | getapp.com |
| **BambooHR** | $6-$9/empleado/mes | Por empleado | bamboohr.com |

#### Costo de un Recruiter (lo que reemplazamos)

```
+------------------------------------------------------------------+
|                    COSTO ANUAL DE UN RECRUITER                    |
+------------------------------------------------------------------+
|                                                                   |
|  Region              Salario Anual    Por Hora    Fuente          |
|  ---------------------------------------------------------------  |
|  USA                 $45,000-$59,000  $22-$28     salary.com      |
|  Alemania            EUR 50,000       EUR 24      glassdoor.com   |
|  UK                  GBP 35,000-45,000 GBP 17-22  glassdoor.co.uk |
|  Brasil              R$ 60,000-90,000 ~$12,000    glassdoor.com.br|
|  Mexico              MXN 300,000      ~$15,000    glassdoor.com.mx|
|                                                                   |
+------------------------------------------------------------------+
```

#### Costo por Contratacion (Cost per Hire)

| Metrica | Valor | Fuente |
|---------|-------|--------|
| Promedio USA | $4,700 | SHRM 2025 |
| Roles tecnicos | $10,000-$20,000 | Paychex |
| Ejecutivos | $28,329 | Paychex |
| Tiempo promedio | 42 dias | SHRM |
| Costo por dia vacante | $500/dia | Recruiterflow |

#### Calculo de Ahorro con BITHIRE

```
+------------------------------------------------------------------+
|              AHORRO ANUAL CON BITHIRE (100 contrataciones)        |
+------------------------------------------------------------------+
|                                                                   |
|  ESCENARIO: Agencia de staffing, 100 contrataciones/ano           |
|                                                                   |
|  SIN BITHIRE:                                                     |
|  |-- 2 Recruiters tiempo completo    $100,000/ano                 |
|  |-- ATS (Bullhorn 10 usuarios)      $24,000/ano                  |
|  |-- LinkedIn Recruiter              $10,000/ano                  |
|  |-- Job boards                      $12,000/ano                  |
|  |-- Background checks               $5,000/ano                   |
|  `-- TOTAL                           $151,000/ano                 |
|                                                                   |
|  CON BITHIRE:                                                     |
|  |-- BITHIRE Professional            $4,788/ano                   |
|  |-- AI hace el screening inicial    (incluido)                   |
|  |-- Voice interviews automatizadas  (incluido)                   |
|  |-- 1 Recruiter (supervision)       $50,000/ano                  |
|  `-- TOTAL                           $54,788/ano                  |
|                                                                   |
|  ===============================================================  |
|  AHORRO ANUAL: $96,212 (64%)                                      |
|  ROI: 20x en el primer ano                                        |
|                                                                   |
+------------------------------------------------------------------+
```

#### Precios Recomendados BITHIRE

| Plan | USA | Europa Occidental | LATAM | Justificacion |
|------|-----|-------------------|-------|---------------|
| **Starter** | $99/mes | EUR 89/mes | $69/mes | Competir con Workable entry |
| **Professional** | $399/mes | EUR 349/mes | $279/mes | Por debajo de Lever, incluye AI |
| **Business** | $999/mes | EUR 899/mes | $699/mes | Multi-location, API access |
| **Enterprise** | Custom | Custom | Custom | White-label, integraciones |

---

### 2. NOCTIS (Ticketing + Bar + Crypto)

#### Competidores y Fees

| Competidor | Fee por Ticket | Payment Fee | Total | Fuente |
|------------|----------------|-------------|-------|--------|
| **Eventbrite** | 3.7% + $1.79 | 2.9% | ~11% | eventbrite.com |
| **Ticketmaster** | 15-25% | Incluido | 15-25% | industry reports |
| **Dice** | ~10% | Incluido | ~10% | dice.fm |
| **Universe** | 2% + $0.99 | 3% | ~7% | universe.com |

#### Valor Agregado de NOCTIS

```
+------------------------------------------------------------------+
|                    NOCTIS vs COMPETENCIA                          |
+------------------------------------------------------------------+
|                                                                   |
|  Feature              Eventbrite   Ticketmaster   NOCTIS          |
|  -------------------------------------------------------------    |
|  Fee por ticket       11%+         15-25%         5-8%            |
|  Bar ordering         No           No             SI              |
|  Crypto payments      No           No             SI              |
|  Analytics avanzado   Basico       Basico         AI-powered      |
|  White-label          No           No             SI              |
|  Multi-venue          Limitado     Si             SI              |
|                                                                   |
+------------------------------------------------------------------+
```

#### Precios Recomendados NOCTIS

**Modelo: Fee por ticket + Suscripcion opcional**

| Modelo | USA | Europa | LATAM | Justificacion |
|--------|-----|--------|-------|---------------|
| **Pay-as-you-go** | 5% + $0.99 | 5% + EUR 0.89 | 5% + $0.69 | 50% menos que Eventbrite |
| **Pro** (sin fee fijo) | 3.5% + $99/mes | 3.5% + EUR 89/mes | 3.5% + $69/mes | Para venues recurrentes |
| **Enterprise** | 2.5% + custom | 2.5% + custom | 2.5% + custom | Alto volumen |

**Add-ons:**
- Bar Module: +$49/mes (USA), +EUR 39/mes (EU), +$29/mes (LATAM)
- Crypto Payments: +$29/mes flat
- AI Analytics (futuro con IRIS): +$99/mes

---

### 3. MESA (Restaurant POS/Ordering)

#### Competidores y Precios

| Competidor | Software/mes | Hardware | Processing | Fuente |
|------------|--------------|----------|------------|--------|
| **Toast** | $0-$69 | $800-$1,000 | 2.49-2.99% | toasttab.com |
| **Square** | $0-$60 | $49-$799 | 2.6% + $0.10 | squareup.com |
| **Clover** | $0-$90 | $499-$1,349 | 2.3-3.5% | clover.com |
| **TouchBistro** | $69+ | Custom | Varies | touchbistro.com |

#### Costo Real para Restaurante (Toast)

```
+------------------------------------------------------------------+
|                COSTO MENSUAL REAL CON TOAST                       |
+------------------------------------------------------------------+
|                                                                   |
|  Restaurante pequeno (1 location):                                |
|  |-- Software                        $69/mes                      |
|  |-- Online ordering add-on          $50/mes                      |
|  |-- Hardware lease                  $100/mes                     |
|  |-- Processing (~$30K ventas)       $750/mes                     |
|  `-- TOTAL                           $969/mes                     |
|                                                                   |
|  Restaurante mediano (2-3 locations):                             |
|  |-- Software                        $200/mes                     |
|  |-- Add-ons                         $200/mes                     |
|  |-- Hardware                        $300/mes                     |
|  |-- Processing (~$100K ventas)      $2,500/mes                   |
|  `-- TOTAL                           $3,200/mes                   |
|                                                                   |
+------------------------------------------------------------------+

Fuente: koronapos.com, owner.com (Toast pricing analysis 2025)
```

#### Precios Recomendados MESA

| Plan | USA | Europa | LATAM | Justificacion |
|------|-----|--------|-------|---------------|
| **Starter** | $49/mes | EUR 39/mes | $29/mes | QR ordering basico |
| **Professional** | $149/mes | EUR 129/mes | $99/mes | Full POS + inventory |
| **Multi-location** | $299/mes | EUR 249/mes | $199/mes | 3+ locations |
| **Processing Fee** | 2.5% + $0.15 | 2.5% + EUR 0.15 | 2.5% + $0.10 | Competitivo |

---

### 4. NEXO (Lending Platform)

#### Competidores y Precios

| Competidor | Modelo | Precio Estimado | Fuente |
|------------|--------|-----------------|--------|
| **MeridianLink** | Enterprise | $50,000-$200,000/ano | meridianlink.com |
| **LendFoundry** | SaaS | $10,000-$50,000/ano | lendfoundry.com |
| **TurnKey Lender** | SaaS | Custom (mid-market) | turnkey-lender.com |
| **nCino** | Enterprise | $100,000+/ano | ncino.com |
| **Build custom** | One-time | $100,000-$500,000 | Industry avg |

#### Precios Recomendados NEXO

| Plan | USA | Europa | LATAM | Justificacion |
|------|-----|--------|-------|---------------|
| **Starter** | $499/mes | EUR 449/mes | $349/mes | Hasta $1M loan volume |
| **Professional** | $1,499/mes | EUR 1,299/mes | $999/mes | Hasta $10M loan volume |
| **Enterprise** | $4,999/mes | EUR 4,499/mes | $3,499/mes | Unlimited + compliance |
| **Transaction Fee** | 0.1-0.5% | 0.1-0.5% | 0.1-0.5% | Por loan originado |

---

### 5. FORTUNA (Gaming/Casino)

#### Competidores y Precios

| Competidor | Modelo | Precio | Fuente |
|------------|--------|--------|--------|
| **SOFTSWISS** | Revenue share | 5-15% GGR | softswiss.com |
| **EveryMatrix** | License + Rev share | Custom | everymatrix.com |
| **Build custom** | One-time | $300K-$1M | sdlccorp.com |
| **GR8 Tech** | White-label | Custom | gr8.tech |

#### Precios Recomendados FORTUNA

| Plan | Precio | Justificacion |
|------|--------|---------------|
| **Platform License** | $2,999/mes | Base platform access |
| **Revenue Share** | 3-8% GGR | Por debajo del standard 5-15% |
| **White-label** | $9,999/mes | Full branding, dedicated |
| **Setup Fee** | $10,000-$50,000 | One-time, según complejidad |

*Nota: Gaming tiene regulaciones estrictas. Precios varian segun jurisdiccion.*

---

### 6. IRIS (Computer Vision/Analytics)

#### Competidores y Precios

| Competidor | Modelo | Precio | Fuente |
|------------|--------|--------|--------|
| **V-Count** | Per location | $2,000-$5,000/ano | v-count.com |
| **RetailNext** | Enterprise | $10,000+/ano | retailnext.net |
| **Trakwell.ai** | SaaS | Custom | trakwell.ai |
| **Google Vision AI** | Usage-based | $1.50/1000 images | cloud.google.com |

#### Precios Recomendados IRIS

| Plan | USA | Europa | LATAM | Justificacion |
|------|-----|--------|-------|---------------|
| **Per Camera** | $49/mes | EUR 39/mes | $29/mes | Basico people counting |
| **Location Bundle** | $199/mes (5 cam) | EUR 169/mes | $139/mes | Pack location |
| **Enterprise** | $999/mes | EUR 849/mes | $699/mes | Unlimited + AI analytics |
| **API Access** | $0.001/analysis | $0.001 | $0.0007 | High volume |

---

## Design System & Frontend

### Valor Diferencial: No Solo Backend

Rottay incluye un **design system completo** con 4 UI engines, lo que elimina la necesidad de:

```
+------------------------------------------------------------------+
|            COSTO DE FRONTEND SI LO HACES TU MISMO                 |
+------------------------------------------------------------------+
|                                                                   |
|  Componente                        Costo                          |
|  -------------------------------------------------------------    |
|  UI Designer (contrato)            $10,000-$30,000                |
|  Frontend Developer                $80,000-$120,000/ano           |
|  Component Library License         $500-$2,000/ano                |
|  Figma/Design Tools                $1,200/ano                     |
|  Theme Development                 $5,000-$15,000                 |
|  White-label Customization         $20,000-$50,000                |
|  -------------------------------------------------------------    |
|  TOTAL PRIMER ANO                  $130,000+                      |
|                                                                   |
|  CON ROTTAY: INCLUIDO EN SUBSCRIPCION                             |
|                                                                   |
+------------------------------------------------------------------+
```

### Pricing por Features de Design System

| Feature | Incluido en | Add-on Cost |
|---------|-------------|-------------|
| **4 UI Engines** (Titan, Hermes, Apollo, Athena) | Todos los planes | - |
| **Theme Presets** (Corporate, BitHire, Minimal) | Todos los planes | - |
| **Portal Customization** (logos, colores, fonts) | Professional+ | - |
| **Custom Theme Development** | Enterprise | $5,000 one-time |
| **White-label Complete** (sin mencion Rottay) | Business+ | Incluido |
| **Email Template Customization** | Professional+ | - |
| **Custom Domain** | Business+ | Incluido |
| **Multiple Themes per Tenant** | Enterprise | $99/mes |

### Valor para White-Label Partners

```
+------------------------------------------------------------------+
|          AHORRO PARA WHITE-LABEL PARTNERS                         |
+------------------------------------------------------------------+
|                                                                   |
|  SIN ROTTAY (desarrollar frontend):                               |
|  |-- UI/UX Design                  $15,000                        |
|  |-- Frontend Development          $60,000                        |
|  |-- Testing & QA                  $10,000                        |
|  |-- White-label setup             $20,000                        |
|  `-- TOTAL                         $105,000                       |
|                                                                   |
|  CON ROTTAY:                                                      |
|  |-- Business Plan                 $999/mes                       |
|  |-- Customization from Portal     Incluido                       |
|  `-- TOTAL ANO 1                   $11,988                        |
|                                                                   |
|  ===============================================================  |
|  AHORRO: $93,000+ (89%)                                           |
|                                                                   |
+------------------------------------------------------------------+
```

---

## Web3 & Blockchain Pricing

### Capacidades Web3 Incluidas

Rottay incluye un modulo Web3 completo con soporte para 3 blockchains, wallets, NFTs y staking.

### Modelo de Pricing Web3

```
+------------------------------------------------------------------+
|                    WEB3 PRICING MODEL                              |
+------------------------------------------------------------------+
|                                                                   |
|  WALLETS                                                          |
|  ---------                                                        |
|  Custodial Wallets (hasta 1,000)       Incluido en Business+      |
|  Custodial Wallets (1,000-10,000)      $0.10/wallet/mes           |
|  Custodial Wallets (10,000+)           $0.05/wallet/mes           |
|  Smart Wallets (session keys)          $0.25/wallet/mes           |
|  MPC Wallets                           Enterprise only            |
|                                                                   |
|  TOKENS & NFTs                                                    |
|  -------------                                                    |
|  Token Deployment (ERC-20)             $500 one-time + gas        |
|  Badge Minting (ERC-1155)              $0.50/badge + gas          |
|  Certificate Minting (ERC-721)         $1.00/cert + gas           |
|  Soulbound NFTs                        $1.50/cert + gas           |
|                                                                   |
|  TRANSACTIONS                                                     |
|  ------------                                                     |
|  Crypto Payment Processing             1.5% per transaction       |
|  Fiat On-Ramp (via MoonPay/Transak)    Pass-through fees          |
|  Token Transfers                       Gas only                   |
|                                                                   |
|  STAKING                                                          |
|  -------                                                          |
|  Staking Pool Setup                    $2,000 one-time            |
|  Pool Management                       0.5% of staked value/ano   |
|                                                                   |
+------------------------------------------------------------------+
```

### Web3 Bundles por Producto

| Producto | Web3 Features | Pricing Model |
|----------|---------------|---------------|
| **NOCTIS** | NFT tickets, crypto payments, loyalty tokens | 1.5% crypto tx + $0.50/NFT ticket |
| **BITHIRE** | Skill certificates, achievement badges | $1/certificate, $0.25/badge |
| **FORTUNA** | Token rewards, crypto gaming | 2% crypto tx + token management |
| **NEXO** | Crypto collateral, stablecoin | Custom enterprise pricing |

### Comparacion con Alternativas

| Proveedor | Setup | Monthly | Per Transaction |
|-----------|-------|---------|-----------------|
| **ThirdWeb** (directo) | $0 | $99-$999 | 2.5%+ |
| **Alchemy** | $0 | $49-$499 | Usage-based |
| **Build Custom** | $50,000+ | $5,000+ | Gas only |
| **ROTTAY** | Incluido | $0-$99 add-on | 1.5% |

### Web3 Add-on Pricing

| Plan | USA | Europa | LATAM |
|------|-----|--------|-------|
| **Basic Web3** (included in Business+) | $0 | $0 | $0 |
| **Advanced Web3** (staking, custom tokens) | $99/mes | EUR 89/mes | $69/mes |
| **Enterprise Web3** (MPC, custom contracts) | Custom | Custom | Custom |

---

## Precios Regionales

### Estrategia de Localizacion

```
+------------------------------------------------------------------+
|                    MULTIPLICADORES REGIONALES                     |
+------------------------------------------------------------------+
|                                                                   |
|  Region                  Multiplicador    Moneda Preferida        |
|  ---------------------------------------------------------------  |
|  USA                     1.00x (base)     USD                     |
|  Canada                  0.95x            CAD o USD               |
|  UK                      1.05x            GBP                     |
|  Europa Occidental       0.90x            EUR                     |
|  Europa del Este         0.70x            EUR o local             |
|  Brasil                  0.65x            BRL o USD               |
|  Mexico                  0.70x            MXN o USD               |
|  Argentina               0.60x            USD (inflacion)         |
|  Chile                   0.70x            CLP o USD               |
|  Colombia                0.65x            COP o USD               |
|                                                                   |
|  Fuente: PPP data, OpenView Partners, Monetizely                  |
|                                                                   |
+------------------------------------------------------------------+
```

### Justificacion por Region

**USA (Base)**
- Mayor poder adquisitivo
- Mercado mas maduro
- Mayor disposicion a pagar por SaaS
- Competencia intensa = precios de mercado

**Europa Occidental (0.90x)**
- Poder adquisitivo similar a USA
- Preferencia por EUR
- Regulaciones mas estrictas (GDPR) = valoran compliance
- Developer tools: pueden pagar 10-20% mas (Monetizely)

**LATAM (0.60-0.70x)**
- PPP gap de 50-70% vs USA
- Empresas mas sensibles al precio
- Adopcion SaaS en crecimiento (28% YoY)
- Boleto Bancário en Brasil, pagos locales
- Oportunidad de first-mover

---

## Propuesta de Valor: All-In-One

### El Problema de "Tool Sprawl"

```
+------------------------------------------------------------------+
|        COSTO DE MANEJAR MULTIPLES SUBSCRIPCIONES                  |
+------------------------------------------------------------------+
|                                                                   |
|  Una empresa tipica de SaaS usa:                                  |
|                                                                   |
|  Herramienta              Costo/mes    Admin Time/mes             |
|  -------------------------------------------------------------    |
|  Auth0                    $2,500       4 horas                    |
|  LaunchDarkly             $3,500       3 horas                    |
|  Vanta                    $2,500       8 horas                    |
|  Segment/Analytics        $1,000       4 horas                    |
|  Twilio                   $500         2 horas                    |
|  AWS/Infra                $2,000       10 horas                   |
|  Stripe Billing           $200         2 horas                    |
|  -------------------------------------------------------------    |
|  TOTAL                    $12,200/mes  33 horas/mes               |
|                                                                   |
|  + Riesgo de integraciones rotas                                  |
|  + Multiples vendors que contactar                                |
|  + Multiples contratos que renovar                                |
|  + Multiples equipos de soporte                                   |
|                                                                   |
+------------------------------------------------------------------+
```

### Con Rottay: Un Solo Vendor

```
+------------------------------------------------------------------+
|                    ROTTAY ALL-IN-ONE                              |
+------------------------------------------------------------------+
|                                                                   |
|  UN SOLO PRECIO incluye:                                          |
|                                                                   |
|  [x] Auth + SSO + MFA                 (Auth0: $2,500/mes)         |
|  [x] Feature Flags                    (LaunchDarkly: $3,500/mes)  |
|  [x] Compliance (SOC2, HIPAA, GDPR)   (Vanta: $2,500/mes)         |
|  [x] Analytics + BI                   (Segment: $1,000/mes)       |
|  [x] Notifications                    (Twilio: $500/mes)          |
|  [x] Multi-tenant infrastructure      (Custom: $2,000/mes)        |
|  [x] Billing/Subscriptions            (Stripe: $200/mes)          |
|  [x] Permission Management            (Custom dev)                |
|  [x] Navigation/UI Framework          (Custom dev)                |
|                                                                   |
|  ===============================================================  |
|                                                                   |
|  VALOR TOTAL:        $12,200+/mes                                 |
|  PRECIO ROTTAY:      $399/mes (Professional)                      |
|  AHORRO:             97%                                          |
|                                                                   |
|  + Un solo punto de contacto                                      |
|  + Una sola factura                                               |
|  + Integraciones garantizadas                                     |
|  + Updates coordinados                                            |
|                                                                   |
+------------------------------------------------------------------+
```

### Mensaje para No-Tecnicos

> "Con Rottay, obtienes una aplicacion segura, escalable y con inteligencia artificial incluida. Sin necesidad de ser experto en tecnologia. Sin manejar 10 subscripciones diferentes. Todo en un solo lugar, con un solo equipo de soporte."

---

## Estrategia Conservadora vs Agresiva

### BITHIRE - Comparacion

| Aspecto | CONSERVADORA | AGRESIVA | Justificacion |
|---------|--------------|----------|---------------|
| **Starter USA** | $149/mes | $79/mes | Conserv: margen saludable. Agresiva: capturar mercado |
| **Professional USA** | $499/mes | $299/mes | Conserv: por debajo de Lever. Agresiva: 60% menos |
| **LATAM Discount** | 25% | 40% | Conserv: margen ok. Agresiva: penetrar mercado |
| **Free Trial** | 14 dias | 30 dias | Agresiva: mas tiempo para convencer |
| **Annual Discount** | 10% | 20% | Agresiva: lock-in clientes |

### NOCTIS - Comparacion

| Aspecto | CONSERVADORA | AGRESIVA | Justificacion |
|---------|--------------|----------|---------------|
| **Fee por ticket** | 5% + $0.99 | 3% + $0.49 | Agresiva: undercut Eventbrite masivamente |
| **Bar module** | $49/mes | Incluido | Agresiva: diferenciador gratis |
| **Crypto** | $29/mes | Incluido | Agresiva: adopcion crypto |

### MESA - Comparacion

| Aspecto | CONSERVADORA | AGRESIVA | Justificacion |
|---------|--------------|----------|---------------|
| **Starter** | $49/mes | $29/mes | Agresiva: competir con Square free |
| **Processing** | 2.5% | 1.9% | Agresiva: margins apretados pero volumen |

### NEXO - Comparacion

| Aspecto | CONSERVADORA | AGRESIVA | Justificacion |
|---------|--------------|----------|---------------|
| **Starter** | $499/mes | $299/mes | Agresiva: accesible para fintechs pequenas |
| **Transaction fee** | 0.3% | 0.1% | Agresiva: capturar volumen |

---

## Recomendaciones Finales

### Estrategia Recomendada: MODERADA-AGRESIVA

Recomiendo una estrategia **moderada-agresiva** por las siguientes razones:

1. **Rottay es nuevo en el mercado** - necesita capturar market share
2. **All-in-one es el diferenciador** - el precio bajo refuerza el mensaje
3. **LATAM es oportunidad** - first mover advantage con precios accesibles
4. **Upsell futuro** - capturar cliente hoy, upsell manana

### Precios Finales Recomendados

#### BITHIRE

| Plan | USA | Europa | LATAM |
|------|-----|--------|-------|
| Starter | $99/mes | EUR 89/mes | $59/mes |
| Professional | $349/mes | EUR 299/mes | $199/mes |
| Business | $799/mes | EUR 699/mes | $499/mes |
| Enterprise | Custom | Custom | Custom |

#### NOCTIS

| Modelo | USA | Europa | LATAM |
|--------|-----|--------|-------|
| Fee por ticket | 4% + $0.79 | 4% + EUR 0.69 | 4% + $0.49 |
| Pro (fee reducido) | 2.5% + $79/mes | 2.5% + EUR 69/mes | 2.5% + $49/mes |
| Bar Module | +$39/mes | +EUR 35/mes | +$25/mes |
| Crypto Module | +$19/mes | +EUR 17/mes | +$12/mes |

#### MESA

| Plan | USA | Europa | LATAM |
|------|-----|--------|-------|
| Starter | $39/mes | EUR 35/mes | $25/mes |
| Professional | $129/mes | EUR 109/mes | $79/mes |
| Multi-location | $249/mes | EUR 219/mes | $159/mes |
| Processing | 2.2% + $0.12 | 2.2% + EUR 0.10 | 2.2% + $0.08 |

#### NEXO

| Plan | USA | Europa | LATAM |
|------|-----|--------|-------|
| Starter | $399/mes | EUR 349/mes | $249/mes |
| Professional | $1,199/mes | EUR 999/mes | $749/mes |
| Enterprise | $3,999/mes | EUR 3,499/mes | $2,499/mes |
| Transaction | 0.2% | 0.2% | 0.15% |

#### FORTUNA

| Plan | Global |
|------|--------|
| Platform License | $2,499/mes |
| Revenue Share | 4-6% GGR |
| White-label | $7,999/mes |
| Setup | $15,000-$40,000 |

#### IRIS

| Plan | USA | Europa | LATAM |
|------|-----|--------|-------|
| Per Camera | $39/mes | EUR 35/mes | $25/mes |
| Location (5 cam) | $149/mes | EUR 129/mes | $99/mes |
| Enterprise | $799/mes | EUR 699/mes | $499/mes |
| API (per analysis) | $0.0008 | $0.0008 | $0.0005 |

---

### Tabla Comparativa: Rottay vs Competencia

```
+------------------------------------------------------------------+
|               COSTO ANUAL: ROTTAY vs COMPETENCIA                  |
+------------------------------------------------------------------+
|                                                                   |
|  Vertical      Competencia (avg)    Rottay Pro      Ahorro        |
|  -------------------------------------------------------------    |
|  ATS           $15,000/ano          $4,188/ano      72%           |
|  Ticketing     11% per ticket       4% per ticket   64%           |
|  POS           $12,000/ano          $1,548/ano      87%           |
|  Lending       $50,000/ano          $14,388/ano     71%           |
|  Gaming        $100,000+/ano        $30,000/ano     70%           |
|  Vision AI     $5,000/ano           $1,788/ano      64%           |
|                                                                   |
+------------------------------------------------------------------+
```

---

### White-Label Pricing

Para partners que quieren revender:

| Modelo | Setup | Monthly | Revenue Share |
|--------|-------|---------|---------------|
| **Shared DB** | $0 | $199-$999/mes | 30% of client revenue |
| **Dedicated DB** | $5,000 | $499-$2,999/mes | 20% of client revenue |
| **Full Source** | $50,000+ | Negotiable | 10% or flat |

---

### Notas de Implementacion

1. **Pagos LATAM**: Integrar Boleto Bancario (Brasil), OXXO (Mexico), Mercado Pago
2. **Moneda**: Mostrar en moneda local, cobrar en USD para estabilidad
3. **Planes anuales**: 15% descuento para lock-in
4. **Trials**: 14 dias free, sin tarjeta de credito
5. **Freemium**: Considerar plan gratis limitado para MESA (competir con Square)

---

## Fuentes y Referencias

1. [Auth0 Pricing](https://auth0.com/pricing) - Enterprise pricing benchmarks
2. [Vanta Pricing](https://www.vanta.com/pricing) - Compliance software costs
3. [LaunchDarkly Pricing](https://launchdarkly.com/pricing/) - Feature flags market
4. [Greenhouse via Vendr](https://www.vendr.com/marketplace/greenhouse) - ATS enterprise pricing
5. [Toast Pricing Analysis](https://koronapos.com/blog/toast-pos-cost-calculator/) - Restaurant POS real costs
6. [Eventbrite Fees](https://www.eventbrite.com/help/en-us/articles/755615/) - Ticketing fee structure
7. [Monetizely Regional Pricing](https://www.getmonetizely.com/articles/regional-vs-global-saas-pricing) - PPP discounts
8. [OpenView SaaS Benchmarks 2023](https://openviewpartners.com/) - Regional pricing data
9. [SHRM Cost per Hire 2025](https://www.shrm.org/) - Recruiting costs
10. [Salary.com Recruiter Salaries](https://www.salary.com/research/salary/recruiting/staffing-agency-recruiter-salary) - Labor costs
11. [Glassdoor Germany](https://www.glassdoor.com/Salaries/germany-recruiter-salary) - EU recruiter salaries
12. [iGaming Costs](https://sdlccorp.com/post/how-much-does-it-cost-to-develop-casino-software/) - Gaming development
13. [Trakwell.ai](https://trakwell.ai/best-people-counters/) - People counting market
14. [Metal SaaS Benchmarks](https://www.metal.so/collections/us-saas-seed-round-benchmarks-2025) - Seed round data

---

*Documento generado: Enero 2026*
*Proxima revision recomendada: Q2 2026*
