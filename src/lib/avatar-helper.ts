import { Participant } from "@/types";
import { maskIdentifier } from "./utils";

const CURATED_AVATARS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCKYVezvPCxMSRG3h_-qxBx9DhGvj4wNWO3l2mzp8BSSIWcN5P9jZvs7CPwmuGT8Z_on5TEOHjJUzYZsLBUfqL5sK9TEO5kR42R9QY_iGjhzlbTcsP7def0Tn-3WCMjg1tO195ToDb6Vkhg4FEcF7_WdUctnap5MPE0vG2hfZmrH9KNM_Fv4UuCORtL5gZhQ1xkj9NnRIAX5k2pOA7uP0LtBO8rgh6LQgmy-M0tKmA3WuXlr4TCr7kRdg",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB_5DhyOS42RZV3xPB54gXEnnuHc99sRHHckcLUJsj-t2zJ0kiuWvzjOn-JIlr3iNn2K7QlmeF4LzKZURQlz5eCnSTc0iiSZMggpgKwYR4JT8dfqa0zNLu5X_X30qJ1mKle7PpepVhS5zPfnR3grreCnrQcJuOOiTZPDmFst_LxAJGavnQoKYWGn_cN8o95kQwWbJOBtjtjir6uLW_ZcHK-Rn_UQf1neIyIRv0EyveVAC_zTKR5on0Xog",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAxGANdU8hIK-rg26OK5wd__8W2ZaeTZRGqHJBamriPKAGWDvprOSqUROsbVgUuV5V1hu1tt8mwtYXHRnR_cDGC7jGf-6di1egK-5-s5oF6oPFD93AawuQF6-2pt2VVbMWy-lZnAGO_EQQB2uQKZ-uMUU1rCSYlYYZydZBrRk8qPMCj6kbXBm1IL8p3ePyfSdQOTnVnBDNcX5j_NJ_aWBmrvRlQCJXJT1dlkItHHD51j8rIaJOXyMg48Q",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDky0Qi6ens_LGXjfsu6ApV4JhMh8-o_-rlRBWtBD-X6ryFsQBG-exSQUX7Cytkfy3womvBi-QRZ0n9XVEbyZdZTRu5yAgTxRvjGTijpxq2tbbr_9P70Pybt452f_nZJ8wr0yi5O27km_fh96DAsCHbiVdhPYWOk9BQ7IBfX5u2hPYFTA-lLhQ7NsgZA-oNcGR0daKq0so-TBEVVUdAYndlK2UqgmEwUYYcIbxONKKiqN60V-jZ2EcQrQ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAMGM2Q1lkfy1QT7ALOC3NkUZyrnCbJpDkpd0lW8kqTIEcB8bBhGP5qeFeVKdaij5TGuTUj5Xs_0DFc9G76SKOSARTNBRNMCzXY6N8-QCkXaCF2ocB02HYpc0Ut18qvUgwRNnXiNka1vOWVt_z8g8tVhW8fTh7MfFij7ge1MN8SVWc1rqX9WI0lggn5PaBXmQPDp05riYetjALoFhh_4l3_si5JTIvfLBpSz0XQbqpYmt-wMI8YmIxp4Q",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA3oOAvXFRzUvCh8tp2z22HwPHdCLFiYYQZu0Co7q4xIwlY0nKf4iM7KHNjK2V6cxI_E9x-c5-FhKvM7jNFYNVwWP3hxqiKnYYMqxBSL_dabth1tFpiaTh5lFGG4N-TZVT1Y5XNPU13tjMQzSQpEOj2KDoR5Ru8EEHfnEckGS3iFkemUsUNCWkjDd7o6BLgRWyF1hd0UFg_jlEO0DQ_R-WDWTyXe--SGwjL4m_QMbF5pSACchKvMhfz8g",
];

export function getParticipantAvatar(participant: Participant, index: number): string {
  // Check if participant has custom avatar in meta
  const metaAvatar = (participant.customMeta as { avatar?: string })?.avatar;
  if (metaAvatar) return metaAvatar;

  // Otherwise pick from curated avatars deterministically by rank or index
  const idx =
    (((participant.rank ? participant.rank - 1 : index) % CURATED_AVATARS.length) +
      CURATED_AVATARS.length) %
    CURATED_AVATARS.length;
  return CURATED_AVATARS[idx];
}

export function getParticipantDeckOrSubtitle(participant: Participant): string {
  const meta = participant.customMeta as Record<string, unknown> | undefined;
  if (meta?.tier) return `${meta.tier} Priority Tier`;
  if (meta?.note) return String(meta.note);
  if (meta?.notes) return String(meta.notes);
  if (meta?.telegram) return `TG: ${meta.telegram}`;
  return `NIM: ${maskIdentifier(participant.identifier)}`;
}

export function getParticipantTierTitle(participant: Participant): string {
  if (participant.rank === 1) return "Grandmaster Champion";
  if (participant.rank === 2) return "Master Contender";
  if (participant.rank === 3) return "Elite Pioneer";
  if (participant.status === "VERIFIED") return "Priority Verified";
  return "Active Contender";
}
