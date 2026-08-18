const OFFICIAL_ADMINISTRATIVE_SUFFIX = /(특별자치도|특별자치시|특별시|광역시|도|시)$/u;
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");

/**
 * Shorten a known official administrative name for customer-search metadata.
 * Callers must supply an authoritative administrative-name allowlist so
 * lexical place names such as 송도, 월미도, and 여의도 are never truncated.
 */
export function shortenOfficialAdministrativeName(value) {
  return value.normalize("NFC").trim().replace(OFFICIAL_ADMINISTRATIVE_SUFFIX, "");
}

export function createKnownAdministrativeNameShortener(officialNames) {
  const replacements = [...new Set(officialNames.map((name) => name.normalize("NFC").trim()))]
    .map((official) => [official, shortenOfficialAdministrativeName(official)])
    .filter(([official, concise]) => concise && concise !== official)
    .sort(([left], [right]) => right.length - left.length);

  return (value) => {
    let result = replacements.reduce(
      (current, [official, concise]) => current.replaceAll(official, concise),
      value.normalize("NFC"),
    );
    for (const [, concise] of replacements) {
      result = result.replace(
        new RegExp(`${escapeRegExp(concise)}\\s+${escapeRegExp(concise)}(?=[가-힣0-9])`, "gu"),
        concise,
      );
    }
    return result;
  };
}
