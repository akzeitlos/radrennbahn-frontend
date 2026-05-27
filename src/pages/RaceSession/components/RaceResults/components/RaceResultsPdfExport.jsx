import { useState } from "react";
import { pdf, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import Button from "@/components/Button/Button.jsx";
import PdfIconAsset from "@/assets/icons/pdf.svg?react";
import SpinnerIconAsset from "@/assets/icons/spinner.svg?react";
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

  colRank:    { width: "6%"  },
  colNr:      { width: "7%"  },
  colName:    { width: "19%" },
  colGender:  { width: "9%"  },
  colClub:    { width: "16%" },
  colClasses: { width: "15%" },
  colPts:     { width: "9%",  textAlign: "right" },
  colLaps:    { width: "9%",  textAlign: "right" },
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
  if (eliminated) return <View style={[styles.statusBadge, styles.statusBadgeElim]}><Text style={styles.statusTextElim}>AUS</Text></View>;
  return           <View style={[styles.statusBadge, styles.statusBadgeOk]}><Text style={styles.statusTextOk}>OK</Text></View>;
};

// ── PDF-Dokument ───────────────────────────────────────────────────────────

const RaceResultsPdfDocument = ({ results, race, modeSlug, filters, raceClasses }) => {
  const now = new Date().toLocaleDateString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
  const showPoints   = ["points", "danish", "tempo"].includes(modeSlug);
  const lapdownMode  = race.lapdownMode;
  const showLaps     = lapdownMode === "lapped" || lapdownMode === "points";
  const filterLabels = buildFilterLabels(filters, raceClasses);



  return (
    <Document title={`Ergebnisse – ${race.raceMode?.title ?? "Rennen"}`} author="Radrennbahn">
      <Page size="A4" orientation="landscape" style={styles.page}>

        {/* Header */}
        <View style={styles.header} fixed>
          <View>
            <Text style={styles.title}>
              {race.raceMode?.title ?? "Rennergebnisse"}
            </Text>
            {race.date && (
              <Text style={styles.subtitle}>
                {new Date(race.date).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}
                {race.raceClasses?.length > 0 ? ` · ${race.raceClasses.map((rc) => rc.name).join(", ")}` : ""}
              </Text>
            )}
            {!race.date && race.raceClasses?.length > 0 && (
              <Text style={styles.subtitle}>
                {race.raceClasses.map((rc) => rc.name).join(", ")}
              </Text>
            )}
            {filterLabels.length > 0 && (
              <Text style={styles.filterLine}>Filter: {filterLabels.join(" · ")}</Text>
            )}
          </View>
          <Text style={styles.metaCount}>{results.length} Starter</Text>
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
          {showLaps && <Text style={[styles.tableHeaderCell, styles.colLaps]}>{lapdownMode === "points" ? "Überr." : "Runden"}</Text>}
          <Text style={[styles.tableHeaderCell, styles.colStatus]}>Status</Text>
        </View>

        {/* Zeilen */}
        {(() => {
          const rankMap = new Map();
          if (modeSlug === "elimination") {
            results.filter((r) => !r.dnf).forEach((r, i) => rankMap.set(r.athleteNumber, i + 1));
          } else {
            results.filter((r) => !r.dnf && !r.eliminated).forEach((r, i) => rankMap.set(r.athleteNumber, i + 1));
          }
          return results.map((r, idx) => {
          const rank = r.dnf ? null : (rankMap.get(r.athleteNumber) ?? null);
          const rankLabel = rank ? String(rank) : "—";
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
              {showLaps && (
                <View style={styles.colLaps}>
                  <Text style={[styles.cell, { textAlign: "right", color: lapdownMode === "points"
                    ? (r.lapPoints > 0 ? GREEN : r.lapPoints < 0 ? RED : DARK_GREY)
                    : (r.laps > 0 ? GREEN : r.laps < 0 ? RED : DARK_GREY) }]}>
                    {lapdownMode === "points"
                      ? (r.lapPoints > 0 ? `+${r.lapPoints}` : r.lapPoints < 0 ? String(r.lapPoints) : "—")
                      : (r.laps > 0 ? `+${r.laps}` : r.laps < 0 ? String(r.laps) : "0")}
                  </Text>
                </View>
              )}
              <View style={styles.colStatus}>
                <StatusBadge dnf={r.dnf} eliminated={r.eliminated} />
              </View>
            </View>
          );
        })
        })()}

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
    <Button
      onClick={handleDownload}
      disabled={loading || results.length === 0}
    >
      {loading ? <><SpinnerIcon />PDF wird erstellt …</> : <><PdfIcon />PDF Ergebnisse</>}
    </Button>
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

const PdfIcon = () => <PdfIconAsset />;

const SpinnerIcon = () => <SpinnerIconAsset className="rr-pdf__icon rr-pdf__icon--spin" />;

export default RaceResultsPdfExport;
