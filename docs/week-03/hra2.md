# Week 3 - HRa2 - Estimation & Hypothesis Testing & Workshop: OCAI

<div style="float:right; max-width:180px; margin:0 0 1rem 1.5rem; text-align:center;">
  <img src="../Confidence_Intervals%20(1).png" alt="Quick recap" title="Quick recap" style="max-width:100%;">
  <br><small><em>Quick recap</em></small>
</div>

## What you will learn

- You know how estimation is done and what you can do with it.
- You are familiar with the terms `point estimates`, `confidence intervals`, `degree of certainty`, `significance`, and `one-tailed` or `two-tailed` tests.
- You are familiar with a way how culture can be measured in a company.
- You know what the OCAI instrument is and what it is used for.
- Apply your data visualization skills to the OCAI data set.

<div style="clear:both;"></div>

## What you will need to prepare

- Read the following chapters in *Jamovi*:
    - §8.1 - Samples, populations and sampling
    - §8.4 - Estimating population parameters
    - §8.5 - Estimating a confidence interval
- Create a possible exam question. It should be a multiple-choice question with 4 answers, of which one is correct. 
- Bring to class (from the video):
    - How does the significance (alpha) tie into Type I and Type II errors?
    - Your beautiful drawing of a confidence interval.
- Memorize the definition of statistical significance:
    - Statistical significance is a determination that a relationship between two or more variables is caused by something other than chance.
    - Statistical significance is used to provide evidence concerning the plausibility of the null hypothesis, which hypothesizes that there is nothing more than random chance at work in the data.
    - Statistical hypothesis testing is used to determine whether the result of a data set is statistically significant.
    - Generally, a p-value lower than 5% is considered statistically significant. (www.investopedia.com, dd.11.02.2022. See also Verhoeven N., *Doing Research*, p. 25)
- Go over the material of the HR lecture on organizational culture you had last week (Ms. Yvonne de Lange).
- Take a good look at the OCAI website, and in particular [the description](https://www.regent.edu/journal/journal-of-practical-consulting/using-the-organizational-cultural-assessment-instsrument-ocai-for-new-team-development/) of the instrument.
- [PowerPoint on confidence intervals](./Confidence%20intervals.pptx)

<iframe title="HMSM M5 HRa p value" width="450" height="300" frameborder="0" scrolling="auto" marginheight="0" marginwidth="0" src="https://zuyd.mediasite.com/Mediasite/Play/54bf639db8644e9bb5a5faf4b323112c1d" allowfullscreen msallowfullscreen allow="fullscreen"></iframe>

<iframe title="HMSM M5 HRa Confidence Interval" width="450" height="300" frameborder="0" scrolling="auto" marginheight="0" marginwidth="0" src="https://zuyd.mediasite.com/Mediasite/Play/10dba64393b74566a38bad07c0d054fd1d" allowfullscreen msallowfullscreen allow="fullscreen"></iframe>

## Your in-class materials

### Part 1 — Content

- Your own exam question

### Part 2 — Workshop

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
