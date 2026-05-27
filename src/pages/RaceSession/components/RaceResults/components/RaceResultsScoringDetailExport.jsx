import { useState } from "react";
import { pdf, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { buildRankMap } from "@/pages/RaceSession/utils/computeResults.js";
import Button from "@/components/Button/Button.jsx";
import PdfIconAsset from "@/assets/icons/pdf.svg?react";
import SpinnerIconAsset from "@/assets/icons/spinner.svg?react";

const BLUE           = "#004177";
const LIGHT_BLUE     = "#b5dbf1";
const LIGHT_RED      = "#fce7f3";
const DARK_RED       = "#600000";
const STRIPE         = "#f0f7ff";
const MID_GREY       = "#888888";
const DARK_GREY      = "#444444";
const GREEN          = "#769e37";
const RED            = "#ee353c";
const HIGHLIGHT      = "#fff7d6";
const HIGHLIGHT_TEXT = "#7a5c00";

// ── Punkte für eine Position berechnen ─────────────────────────────────────

function getPointsForPosition(posIdx, modeSlug, race, entry, isLastRound) {
  if (modeSlug === "points") {
    const base = [
      race.pointsFirst  ?? 5,
      race.pointsSecond ?? 3,
      race.pointsThird  ?? 2,
      race.pointsFourth ?? 1,
    ];
    if (posIdx >= base.length) return 0;
    return isLastRound ? base[posIdx] * 2 : base[posIdx];
  }
  if (modeSlug === "danish") {
    const roundIndex = (entry.roundNumber ?? 1) - 1;
    const dist = race.danishScoringRounds?.[roundIndex]?.pointsDistribution ?? [];
    return dist[posIdx] ?? 0;
  }
  if (modeSlug === "tempo") {
    const base = [race.pointsFirst ?? 2, race.pointsSecond ?? 1];
    return base[posIdx] ?? 0;
  }
  return 0;
}

// ── Daten aufbereiten ──────────────────────────────────────────────────────

function buildScoringData(entries, race, modeSlug, results) {
  const scoringEntries = entries.filter((e) => e.type === "scoring");
  if (!scoringEntries.length) return null;

  const totalRounds   = race.rounds ?? 0;
  const interval      = race.scoringInterval ?? 1;
  const scoringRoundCount = Math.floor(totalRounds / interval);

  // Round-Nummern in Reihenfolge
  const rounds = scoringEntries.map((e, i) => e.roundNumber ?? i + 1);

  // athleteNumber → { [roundNum]: pts }
  const pointsMap = {};
  scoringEntries.forEach((entry, entryIdx) => {
    const roundNum = entry.roundNumber ?? entryIdx + 1;
    const isLast   = entry.isLast || entryIdx === scoringRoundCount - 1;
    entry.positions.forEach((nr, posIdx) => {
      if (!pointsMap[nr]) pointsMap[nr] = {};
      const pts = getPointsForPosition(posIdx, modeSlug, race, entry, isLast);
      if (pts > 0) pointsMap[nr][roundNum] = pts;
    });
  });

  // Fahrer in Ergebnis-Reihenfolge
  const athletes = [...results];

  return { rounds, pointsMap, athletes };
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 8,
    paddingTop: 36,
    paddingBottom: 30,
    paddingHorizontal: 40,
    color: DARK_GREY,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 2,
    borderBottomColor: BLUE,
    paddingBottom: 6,
    marginBottom: 10,
  },
  title:    { fontSize: 16, fontFamily: "Helvetica-Bold", color: BLUE, marginBottom: 2 },
  subtitle: { fontSize: 7.5, color: MID_GREY },
  metaDate: { fontSize: 7, color: MID_GREY },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: BLUE,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 2,
    marginBottom: 1,
  },
  thCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6.5,
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
    alignItems: "center",
  },
  rowAlt: { backgroundColor: STRIPE },
  rowDnf: { opacity: 0.4 },

  cell:        { fontSize: 7.5, color: DARK_GREY, textAlign: "center" },
  cellName:    { fontSize: 7.5, color: DARK_GREY, fontFamily: "Helvetica-Bold" },
  cellRank:    { fontSize: 8,   color: BLUE,       fontFamily: "Helvetica-Bold", textAlign: "center" },
  cellTotal:   { fontSize: 8,   color: BLUE,       fontFamily: "Helvetica-Bold", textAlign: "center" },
  cellPts:     { fontSize: 7.5, color: BLUE,       fontFamily: "Helvetica-Bold", textAlign: "center" },
  cellMeta:    { fontSize: 7,   color: MID_GREY },

  genderBadge:  { borderRadius: 6, paddingHorizontal: 3, paddingVertical: 1, alignSelf: "center" },
  genderBadgeM: { backgroundColor: LIGHT_BLUE },
  genderBadgeF: { backgroundColor: LIGHT_RED },
  genderTextM:  { fontSize: 6.5, color: BLUE,     fontFamily: "Helvetica-Bold" },
  genderTextF:  { fontSize: 6.5, color: DARK_RED, fontFamily: "Helvetica-Bold" },

  statusOk:   { fontSize: 7, color: GREEN, fontFamily: "Helvetica-Bold", textAlign: "center" },
  statusDnf:  { fontSize: 7, color: RED,   fontFamily: "Helvetica-Bold", textAlign: "center" },
  statusElim: { fontSize: 7, color: MID_GREY, fontFamily: "Helvetica-Bold", textAlign: "center" },

  lapsUp:   { fontSize: 7.5, color: GREEN, fontFamily: "Helvetica-Bold", textAlign: "center" },
  lapsDown: { fontSize: 7.5, color: RED,   fontFamily: "Helvetica-Bold", textAlign: "center" },

  footer: {
    position: "absolute",
    bottom: 14, left: 40, right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: "#cccccc",
    paddingTop: 3,
  },
  footerText: { fontSize: 6.5, color: MID_GREY },
});

// ── PDF-Dokument ───────────────────────────────────────────────────────────

const ScoringDetailDocument = ({ entries, race, modeSlug, results }) => {
  const data = buildScoringData(entries, race, modeSlug, results);
  if (!data) return null;

  const { rounds, pointsMap, athletes } = data;
  const now = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

  const lapdownMode = race.lapdownMode;
  const showLaps    = lapdownMode === "lapped" || lapdownMode === "points";

  // Spaltenbreiten
  const COL_RANK   = 18;
  const COL_NR     = 20;
  const COL_NAME   = 90;
  const COL_GENDER = 18;
  const COL_CLASS  = 52;
  const COL_CLUB   = 68;
  const COL_TOTAL  = 28;
  const COL_LAPS   = 28;
  const COL_STATUS = 28;

  // A4 landscape usable: 841 - 80 = 761px
  const fixedCols = COL_RANK + COL_NR + COL_NAME + COL_GENDER + COL_CLASS + COL_CLUB
    + COL_TOTAL + COL_STATUS + (showLaps ? COL_LAPS : 0);
  const colRound = Math.max(20, Math.floor((761 - fixedCols) / rounds.length));

  return (
    <Document title={`Wertungsübersicht – ${race.raceMode?.title ?? "Rennen"}`} author="Radrennbahn">
      <Page size="A4" orientation="landscape" style={styles.page}>

        {/* Header */}
        <View style={styles.header} fixed>
          <View>
            <Text style={styles.title}>{race.raceMode?.title ?? "Wertungsübersicht"}</Text>
            <Text style={styles.subtitle}>
              {race.date
                ? new Date(race.date).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })
                : ""}
              {race.raceClasses?.length > 0 ? ` · ${race.raceClasses.map((rc) => rc.name).join(", ")}` : ""}
              {" · Wertungsübersicht"}
            </Text>
          </View>
          <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: BLUE }}>
            {athletes.length} Starter
          </Text>
        </View>

        {/* Tabellen-Header */}
        <View style={styles.tableHeader} fixed>
          <Text style={[styles.thCell, { width: COL_RANK }]}>#</Text>
          <Text style={[styles.thCell, { width: COL_NR }]}>Nr.</Text>
          <Text style={[styles.thCell, { width: COL_NAME, textAlign: "left" }]}>Name</Text>
          <Text style={[styles.thCell, { width: COL_GENDER }]}>G</Text>
          <Text style={[styles.thCell, { width: COL_CLASS, textAlign: "left" }]}>Klasse</Text>
          <Text style={[styles.thCell, { width: COL_CLUB, textAlign: "left" }]}>Verein</Text>
          {rounds.map((r) => (
            <Text key={r} style={[styles.thCell, { width: colRound }]}>W{r}</Text>
          ))}
          <Text style={[styles.thCell, { width: COL_TOTAL }]}>Gesamt</Text>
          {showLaps && <Text style={[styles.thCell, { width: COL_LAPS }]}>{lapdownMode === "points" ? "Überr." : "Rd."}</Text>}
          <Text style={[styles.thCell, { width: COL_STATUS }]}>Status</Text>
        </View>

        {/* Zeilen */}
        {(() => {
          const rankMap = buildRankMap(athletes, modeSlug, race.lapdownMode);
          return athletes.map((r, idx) => {
            const currentRank = r.dnf || r.eliminated ? null : (rankMap.get(r.athleteNumber) ?? null);
            const isAlt    = idx % 2 === 1;
            const res      = results.find((res) => res.athleteNumber === r.athleteNumber);
            const total    = res?.points ?? 0;
            const laps     = res?.laps ?? 0;
            const lapPts   = res?.lapPoints ?? 0;
            const athlete  = race.athletes?.find((a) => a.raceNumber === r.athleteNumber);
            const name     = athlete ? `${athlete.firstname} ${athlete.lastname}` : r.name ?? `#${r.athleteNumber}`;
            const gender   = (athlete?.gender ?? "").toLowerCase();
            const isMale   = gender === "m" || gender === "male" || gender === "männlich";
            const isFemale = gender === "f" || gender === "female" || gender === "weiblich" || gender === "w";
            const classes  = athlete?.raceClasses?.map((rc) => rc.name ?? rc.title).join(", ") ?? "—";
            const club     = athlete?.club?.name ?? "—";

            const lapValue = lapdownMode === "points" ? lapPts : laps;
            const lapLabel = lapValue > 0 ? `+${lapValue}` : lapValue < 0 ? String(lapValue) : "—";

            return (
              <View
                key={r.athleteNumber}
                style={[styles.row, isAlt ? styles.rowAlt : {}, (r.dnf || r.eliminated) ? styles.rowDnf : {}]}
                wrap={false}
              >
                <Text style={[styles.cellRank, { width: COL_RANK }]}>{currentRank ?? "—"}</Text>
                <Text style={[styles.cell,     { width: COL_NR }]}>{r.athleteNumber}</Text>
                <Text style={[styles.cellName, { width: COL_NAME }]}>{name}</Text>

                {/* Geschlecht */}
                <View style={{ width: COL_GENDER, alignItems: "center" }}>
                  {isMale || isFemale ? (
                    <View style={[styles.genderBadge, isMale ? styles.genderBadgeM : styles.genderBadgeF]}>
                      <Text style={isMale ? styles.genderTextM : styles.genderTextF}>
                        {isMale ? "m" : "w"}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.cellMeta}>—</Text>
                  )}
                </View>

                {/* Klasse(n) */}
                <Text style={[styles.cellMeta, { width: COL_CLASS }]}>{classes}</Text>

                {/* Verein */}
                <Text style={[styles.cellMeta, { width: COL_CLUB }]}>{club}</Text>

                {/* Wertungsrunden */}
                {rounds.map((rnd) => {
                  const pts = pointsMap[r.athleteNumber]?.[rnd];
                  return (
                    <View key={rnd} style={{ width: colRound, alignItems: "center" }}>
                      {pts > 0 ? (
                        <Text style={styles.cellPts}>{pts}</Text>
                      ) : (
                        <Text style={[styles.cell, { color: "#cccccc" }]}>·</Text>
                      )}
                    </View>
                  );
                })}

                {/* Gesamt */}
                <Text style={[styles.cellTotal, { width: COL_TOTAL }]}>{total || "—"}</Text>

                {/* Überrundungen */}
                {showLaps && (
                  <Text style={[
                    lapValue > 0 ? styles.lapsUp : lapValue < 0 ? styles.lapsDown : styles.cell,
                    { width: COL_LAPS }
                  ]}>
                    {lapLabel}
                  </Text>
                )}

                {/* Status */}
                <Text style={[
                  r.dnf ? styles.statusDnf : r.eliminated ? styles.statusElim : styles.statusOk,
                  { width: COL_STATUS }
                ]}>
                  {r.dnf ? "DNF" : r.eliminated ? "AUS" : "OK"}
                </Text>
              </View>
            );
          });
        })()}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Radrennbahn · {race.raceMode?.title} · Wertungsübersicht</Text>
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

const RaceResultsScoringDetailExport = ({ entries, race, modeSlug, results }) => {
  const [loading, setLoading] = useState(false);

  const scoringEntries = entries?.filter((e) => e.type === "scoring") ?? [];
  if (!["points", "danish", "tempo"].includes(modeSlug) || scoringEntries.length === 0) {
    return null;
  }

  const handleDownload = async () => {
    setLoading(true);
    try {
      const blob = await pdf(
        <ScoringDetailDocument
          entries={entries}
          race={race}
          modeSlug={modeSlug}
          results={results}
        />
      ).toBlob();
      const url  = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href     = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      link.download = `wertungsuebersicht_${race.raceMode?.slug ?? "rennen"}_${dateStr}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={loading}
    >
      {loading
        ? <><SpinnerIcon />Wird erstellt …</>
        : <><PdfIcon />PDF Wertung</>
      }
    </Button>
  );
};

const PdfIcon     = () => <PdfIconAsset />;
const SpinnerIcon = () => <SpinnerIconAsset className="rr-pdf__icon rr-pdf__icon--spin" />;

export default RaceResultsScoringDetailExport;
