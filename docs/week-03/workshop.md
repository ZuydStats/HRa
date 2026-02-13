# Week 3 - Workshop

## Meeting 3 (HRA3) - OCAI

### What you will learn

- You are familiar with a way how culture can be measured in a company.
- You know what the OCAI instrument is and what it is used for.
- Apply your data visualization skills to the OCAI data set.

### What you will need to prepare

- Go over the material of the HR lecture on organizational culture you had last week (Ms. Yvonne de Lange).
- Take a good look at the OCAI website, and in particular [the description](https://www.regent.edu/journal/journal-of-practical-consulting/using-the-organizational-cultural-assessment-instsrument-ocai-for-new-team-development/) of the instrument.

### Your in-class material

- Download and explore the [OCAI data file](./OCAI%20dataset.sav) on the Myriad Hotel.
- Answer the following questions:
  - What, according to its staff, is the current cultural makeup of the Myriad Hotel?
    - *Hint: `adh_current` is missing. First use **compute** to create this variable.*
    - *Use the 4 **means** of `adh_current`, `clan_current`, `mark_current` and `hier_current`.*
  - What, according to its staff, is the desired cultural makeup of the Myriad Hotel?
    - *Hint: `hier_wanted` is missing. First use **compute** to create this variable.*
    - *Use the 4 **means** of `adh_wanted`, `clan_wanted`, `mark_wanted` and `hier_wanted`.*
  - With the strategic views of which brother, Charles or Stefan, is this situation most in line? Explain your answer.
    - *Hint: from the Myriad case, what type(s) of company culture do Charles and Stefan prefer? Compare this to your previous answers.*
  - What differences in the current and desired situation can be seen across the various departments? How could you explain these differences? Would these differences exist in the same way in other hotels?
    - *Hint: compare the means of all 8 variables used in the first two questions split out over the variable `Department`. You can use descriptives and a clustered bar chart for visualization.*
  - What (HR) advice would you give to the management of the Myriad Hotel, based on your analysis? Explain.
