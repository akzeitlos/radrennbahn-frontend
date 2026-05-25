import { useState } from "react";
import { pdf, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import "./RaceResultsPdfExport.css";

const BLUE       = "#004177";
const LIGHT_BLUE = "#b5dbf1";
const LIGHT_RED  = "#fce7f3";
const DARK_RED   = "#600000";
const STRIPE     = "#f0f7ff";
const MID_GREY   = "#888888";
const DARK_GREY  = "#444444";
const GREEN      = "#769e37";
const RED        = "#ee353c";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    paddingTop: 42,
    paddingBottom: 36,
    paddingHorizontal: 48,
    color: DARK_GREY,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 2,
    borderBottomColor: BLUE,
    paddingBottom: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 8.5,
    color: MID_GREY,
    marginBottom: 2,
  },
  filterLine: {
    fontSize: 7.5,
    color: MID_GREY,
  },
  metaBlock: { alignItems: "flex-end" },
  metaCount: { fontSize: 9, fontFamily: "Helvetica-Bold", color: BLUE, marginBottom: 2 },
  metaDate:  { fontSize: 7.5, color: MID_GREY },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: BLUE,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 2,
    marginBottom: 1,
  },
  tableHeaderCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
    alignItems: "center",
  },
  rowAlt:  { backgroundColor: STRIPE },
  rowDnf:  { opacity: 0.45 },
  cell:    { fontSize: 8.5, color: DARK_GREY },

  colRank:    { width: "7%"  },
  colNr:      { width: "8%"  },
  colName:    { width: "20%" },
  colGender:  { width: "10%" },
  colClub:    { width: "18%" },
  colClasses: { width: "17%" },
  colPts:     { width: "10%", textAlign: "right" },
  colStatus:  { width: "10%", textAlign: "center" },

  rankText:  { fontFamily: "Helvetica-Bold", fontSize: 9, color: BLUE },
  nameText:  { fontFamily: "Helvetica-Bold", color: BLUE, fontSize: 8.5 },
  nrText:    { fontFamily: "Helvetica-Bold", color: BLUE, fontSize: 8.5 },

  genderBadge:  { borderRadius: 8, paddingHorizontal: 4, paddingVertical: 1.5, alignSelf: "flex-start" },
  genderBadgeM: { backgroundColor: LIGHT_BLUE },
  genderBadgeF: { backgroundColor: LIGHT_RED  },
  genderTextM:  { color: BLUE,     fontSize: 7.5, fontFamily: "Helvetica-Bold" },
  genderTextF:  { color: DARK_RED, fontSize: 7.5, fontFamily: "Helvetica-Bold" },

  classesWrap: { flexDirection: "row", flexWrap: "wrap" },
  classBadge:  { backgroundColor: LIGHT_BLUE, borderRadius: 8, paddingHorizontal: 3, paddingVertical: 1, marginRight: 2, marginBottom: 1 },
  classBadgeText: { color: BLUE, fontSize: 7, fontFamily: "Helvetica-Bold" },

  statusBadge:     { borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1.5, alignSelf: "center" },
  statusBadgeOk:   { backgroundColor: "#edf7e1" },
  statusBadgeDnf:  { backgroundColor: "#fde8e8" },
  statusBadgeElim: { backgroundColor: "#f3f3f3" },
  statusTextOk:    { color: GREEN, fontSize: 7.5, fontFamily: "Helvetica-Bold" },
  statusTextDnf:   { color: RED,   fontSize: 7.5, fontFamily: "Helvetica-Bold" },
  statusTextElim:  { color: DARK_GREY, fontSize: 7.5, fontFamily: "Helvetica-Bold" },

  footer: {
    position: "absolute",
    bottom: 18, left: 48, right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: "#cccccc",
    paddingTop: 4,
  },
  footerText: { fontSize: 7, color: MID_GREY },
});

// ── Sub-Komponenten ────────────────────────────────────────────────────────

const GenderBadge = ({ gender }) => {
  if (!gender) return <Text style={styles.cell}>—</Text>;
  const isMale = gender === "m" || gender === "male" || gender === "männlich";
  return (
    <View style={[styles.genderBadge, isMale ? styles.genderBadgeM : styles.genderBadgeF]}>
      <Text style={isMale ? styles.genderTextM : styles.genderTextF}>
        {isMale ? "m" : "w"}
      </Text>
    </View>
  );
};

const ClassBadges = ({ raceClasses }) => {
  if (!raceClasses?.length) return <Text style={styles.cell}>—</Text>;
  return (
    <View style={styles.classesWrap}>
      {raceClasses.map((rc) => (
        <View key={rc.id} style={styles.classBadge}>
          <Text style={styles.classBadgeText}>{rc.title ?? rc.name}</Text>
        </View>
      ))}
    </View>
  );
};

const StatusBadge = ({ dnf, eliminated }) => {
  if (dnf)        return <View style={[styles.statusBadge, styles.statusBadgeDnf]}><Text style={styles.statusTextDnf}>DNF</Text></View>;
  if (eliminated) return <View style={[styles.statusBadge, styles.statusBadgeElim]}><Text style={styles.statusTextElim}>OUT</Text></View>;
  return           <View style={[styles.statusBadge, styles.statusBadgeOk]}><Text style={styles.statusTextOk}>✓</Text></View>;
};

// ── PDF-Dokument ───────────────────────────────────────────────────────────

const RaceResultsPdfDocument = ({ results, race, modeSlug, filters, raceClasses }) => {
  const now = new Date().toLocaleDateString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
  const showPoints = ["points", "danish", "tempo"].includes(modeSlug);
  const showLaps   = race.lapdownMode === "lapped";
  const filterLabels = buildFilterLabels(filters, raceClasses);

  const MEDAL = ["🥇", "🥈", "🥉"];

  return (
    <Document title={`Ergebnisse – ${race.raceMode?.title ?? "Rennen"}`} author="Radrennbahn">
      <Page size="A4" orientation="landscape" style={styles.page}>

        {/* Header */}
        <View style={styles.header} fixed>
          <View>
            <Text style={styles.title}>
              {race.raceMode?.title ?? "Rennergebnisse"}
            </Text>
            {race.raceClasses?.length > 0 && (
              <Text style={styles.subtitle}>
                {race.raceClasses.map((rc) => rc.name).join(", ")}
              </Text>
            )}
            {filterLabels.length > 0 && (
              <Text style={styles.filterLine}>Filter: {filterLabels.join(" · ")}</Text>
            )}
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaCount}>{results.length} Starter</Text>
            <Text style={styles.metaDate}>Stand: {now}</Text>
          </View>
        </View>

        {/* Tabellen-Header */}
        <View style={styles.tableHeader} fixed>
          <Text style={[styles.tableHeaderCell, styles.colRank]}>#</Text>
          <Text style={[styles.tableHeaderCell, styles.colNr]}>Nr.</Text>
          <Text style={[styles.tableHeaderCell, styles.colName]}>Name</Text>
          <Text style={[styles.tableHeaderCell, styles.colGender]}>Geschl.</Text>
          <Text style={[styles.tableHeaderCell, styles.colClub]}>Verein</Text>
          <Text style={[styles.tableHeaderCell, styles.colClasses]}>Klassen</Text>
          {showPoints && <Text style={[styles.tableHeaderCell, styles.colPts]}>Punkte</Text>}
          <Text style={[styles.tableHeaderCell, styles.colStatus]}>Status</Text>
        </View>

        {/* Zeilen */}
        {results.map((r, idx) => {
          const rank = r.dnf || r.eliminated ? null : idx + 1;
          const rankLabel = rank && rank <= 3 ? MEDAL[rank - 1] : (rank ? String(rank) : "—");
          const isAlt = idx % 2 === 1;

          // Athlet-Daten aus race.athletes
          const athlete = race.athletes?.find((a) => a.raceNumber === r.athleteNumber);

          return (
            <View
              key={r.athleteNumber}
              style={[styles.row, isAlt ? styles.rowAlt : {}, (r.dnf || r.eliminated) ? styles.rowDnf : {}]}
              wrap={false}
            >
              <View style={styles.colRank}>
                <Text style={styles.rankText}>{rankLabel}</Text>
              </View>
              <View style={styles.colNr}>
                <Text style={styles.nrText}>{r.athleteNumber}</Text>
              </View>
              <View style={styles.colName}>
                <Text style={styles.nameText}>{r.name}</Text>
              </View>
              <View style={styles.colGender}>
                <GenderBadge gender={athlete?.gender} />
              </View>
              <View style={styles.colClub}>
                <Text style={styles.cell}>{athlete?.club?.name ?? "—"}</Text>
              </View>
              <View style={styles.colClasses}>
                <ClassBadges raceClasses={athlete?.raceClasses} />
              </View>
              {showPoints && (
                <View style={styles.colPts}>
                  <Text style={[styles.cell, { fontFamily: "Helvetica-Bold", textAlign: "right" }]}>
                    {r.points}
                  </Text>
                </View>
              )}
              <View style={styles.colStatus}>
                <StatusBadge dnf={r.dnf} eliminated={r.eliminated} />
              </View>
            </View>
          );
        })}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Radrennbahn · {race.raceMode?.title ?? "Ergebnisse"}</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Seite ${pageNumber} / ${totalPages}`}
          />
        </View>

      </Page>
    </Document>
  );
};

// ── Export-Button ──────────────────────────────────────────────────────────

const RaceResultsPdfExport = ({ results, race, modeSlug, filters, raceClasses }) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const blob = await pdf(
        <RaceResultsPdfDocument
          results={results}
          race={race}
          modeSlug={modeSlug}
          filters={filters}
          raceClasses={raceClasses}
        />
      ).toBlob();
      const url  = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href     = url;
      link.download = buildFilename(race, filters, raceClasses);
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`rr-pdf__btn ${loading ? "rr-pdf__btn--loading" : ""}`}
      onClick={handleDownload}
      disabled={loading || results.length === 0}
      title={results.length === 0 ? "Keine Ergebnisse zum Exportieren" : "Ergebnisse als PDF herunterladen"}
    >
      {loading ? (<><SpinnerIcon />PDF wird erstellt …</>) : (<><PdfIcon />PDF exportieren</>)}
    </button>
  );
};

// ── Helpers ────────────────────────────────────────────────────────────────

function buildFilterLabels(filters, raceClasses) {
  const labels = [];
  if (filters?.search)         labels.push(`Suche: „${filters.search}"`);
  if (filters?.gender === "m") labels.push("Männlich");
  if (filters?.gender === "f") labels.push("Weiblich");
  if (filters?.raceClassIds?.length > 0) {
    const names = filters.raceClassIds.map((id) => {
      const rc = raceClasses?.find((r) => r.id === id);
      return rc ? (rc.title ?? rc.name) : id;
    });
    labels.push(`Klassen: ${names.join(", ")}`);
  }
  return labels;
}

function buildFilename(race, filters, raceClasses) {
  const parts = ["ergebnisse", (race.raceMode?.slug ?? "rennen")];
  if (filters?.gender === "m") parts.push("maennlich");
  if (filters?.gender === "f") parts.push("weiblich");
  if (filters?.raceClassIds?.length > 0) {
    filters.raceClassIds.forEach((id) => {
      const rc = raceClasses?.find((r) => r.id === id);
      if (rc) parts.push((rc.title ?? rc.name).toLowerCase().replace(/\s+/g, "-"));
    });
  }
  parts.push(new Date().toISOString().slice(0, 10));
  return `${parts.join("_")}.pdf`;
}

// ── Icons ──────────────────────────────────────────────────────────────────

const PdfIcon = () => (
  <svg className="rr-pdf__icon" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const SpinnerIcon = () => (
  <svg className="rr-pdf__icon rr-pdf__icon--spin" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

export default RaceResultsPdfExport;
